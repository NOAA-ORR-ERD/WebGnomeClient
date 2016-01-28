define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'ol',
    'nucos',
    'mousetrap',
    'sweetalert',
    'views/modal/form',
    'text!templates/form/wind.html',
    'text!templates/form/wind/variable-input.html',
    'text!templates/form/wind/variable-static.html',
    'views/default/map',
    'model/resources/nws_wind_forecast',
    'compassui',
    'jqueryui/slider',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, ol, nucos, Mousetrap, swal, FormModal, FormTemplate, VarInputTemplate, VarStaticTemplate, OlMapView, NwsWind){
    'use strict';
    var windForm = FormModal.extend({
        title: 'Wind',
        className: 'modal form-modal wind-form',
        events: function(){
            var formModalHash = FormModal.prototype.events;
            delete formModalHash['change input'];
            delete formModalHash['keyup input'];
            formModalHash['change input:not(tbody input)'] = 'update';
            formModalHash['keyup input:not(tbody input)'] = 'update';
            return _.defaults({
                'shown.bs.tab': 'tabRendered',
                'click .add': 'addTimeseriesEntry',
                'click .edit': 'modifyTimeseriesEntry',
                'click .trash': 'removeTimeseriesEntry',
                'click .ok': 'enterTimeseriesEntry',
                'click .undo': 'cancelTimeseriesEntry',
                'click .variable': 'unbindBaseMouseTrap',
                'click .nav-tabs li:not(.variable)': 'rebindBaseMouseTrap',
                'ready': 'rendered',
                'click .clear-winds': 'clearTimeseries'
            }, formModalHash);
        },

        initialize: function(options, GnomeWind){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = GnomeWind;
            this.source = new ol.source.Vector();
            this.layer = new ol.layer.Vector({
                source: this.source,
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1.0],
                        src: '/img/map-pin.png',
                        size: [32, 40]
                    })
                })
            });
            this.ol = new OlMapView({
                id: 'wind-form-map',
                zoom: 7,
                center: ol.proj.transform([-137.49, 47.97], 'EPSG:4326', 'EPSG:3857'),
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    }),
                    new ol.layer.Vector({
                        source: new ol.source.Vector({
                            format: new ol.format.GeoJSON(),
                            url: '/resource/nws_coast.json',
                        }),
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                width: 2,
                                color: '#428bca'
                            })
                        })
                    }),
                    this.layer
                ]
            });
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                timeseries: this.model.get('timeseries'),
                unit: this.model.get('units')
            });
            FormModal.prototype.render.call(this, options);

            this.form = {};
            this.form.constant = {};
            this.form.constant.speed = this.$('#constant-speed');
            this.form.constant.direction = this.$('#constant-direction');
            this.form.variable = {};
            this.form.variable.speed = this.$('#variable-speed');
            this.form.variable.direction = this.$('#variable-direction');
            this.form.variable.datetime = this.$('#datetime');
            this.form.variable.increment = this.$('#incrementCount');
            this.trigger('show');
            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('#datetime').datetimepicker('show');
            }, this));
            this.$('select[name="units"]').find('option[value="' + this.model.get('units') + '"]').attr('selected', 'selected');
            setTimeout(_.bind(function(){
                this.$('#constant .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('#constant .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('timeseries')[0][1][0] + '</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateConstantSlide(ui);
                    }, this)
                });

                var constantSliderMax = this.$('#constant .slider').slider("option", "max");
                this.$('#constant .slider').slider("option", "value", this.model.get('speed_uncertainty_scale') * (50.0 / 3));
            }, this), 1);

            setTimeout(_.bind(function(){
                this.$('#variable .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('#variable .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">+/- ' + this.model.get('speed_uncertainty_scale') * 5 + ' %</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateVariableSlide(ui);
                    }, this)
                });

                var variableSliderMax = this.$('#variable .slider').slider("option", "max");
                this.$('#variable .slider').slider("option", "value", this.model.get('speed_uncertainty_scale') * (50.0 / 3));
                this.renderTimeseries();
            }, this), 1);
            $('.modal').on('scroll', this.variableWindStickyHeader);

            this.rendered();
        },

        rendered: function(){
            if(this.model.get('timeseries').length <= 1){
                this.$('.nav-tabs a[href="#constant"]').tab('show');
            } else {
                this.$('.nav-tabs a[href="#variable"]').tab('show');
            }
        },

        tabRendered: function(e){
            // preserve the original timeseries if one exists longer than 1 entry
            if(this.model.get('timeseries').length > 1){
                this.originalTimeseries = this.model.get('timeseries');
            }

            if(e.target.hash === '#constant'){
                if(this.$('.constant-compass canvas').length === 0){
                    this.$('.constant-compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.constantCompassUpdate, this)
                    });

                    this.$('.constant-compass').compassRoseUI('update', {
                        speed: this.form.constant.speed.val(),
                        direction: this.form.constant.direction.val()
                    });
                }
            } else if (e.target.hash === '#variable') {
                if(this.$('.variable-compass canvas').length === 0){
                    this.$('.variable-compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.variableCompassUpdate, this)
                    });
                }

                if(!_.isUndefined(this.originalTimeseries)){
                    this.model.set('timeseries', this.originalTimeseries);
                }
                this.updateTooltipWidth();
                this.unbindBaseMouseTrap();
                this.renderTimeseries();
            } else if (e.target.hash === '#nws'){
                if(this.$('#wind-form-map canvas').length === 0){
                    this.ol.render();
                    this.ol.setMapOrientation();
                    this.ol.map.on('click', _.bind(function(e){
                        this.clearError();
                        this.source.forEachFeature(function(feature){
                            this.source.removeFeature(feature);
                        }, this);

                        var feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                        var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                        this.source.addFeature(feature);
                        this.nws = new NwsWind({lat: coords[1], lon: coords[0]});
                        this.$('.save').addClass('disabled');
                        this.nws.fetch({
                            success: _.bind(this.nwsLoad, this),
                            error: _.bind(this.nwsError, this)
                        });
                    }, this));
                }
            }
            $(window).trigger('resize');
        },

        nwsLoad: function(model){
            this.model.set('timeseries', model.get('timeseries'));
            this.model.set('units', model.get('units'));
            this.$('.variable a').tab('show');
            this.$('.save').removeClass('disabled');
        },

        nwsError: function(){
            this.error('Error!', 'No NWS forecast data found');
            this.$('.save').removeClass('disabled');
        },

        update: function(compass){
            var active = this.$('.nav-tabs:last .active a').attr('href').replace('#', '');
            var speed = this.form[active].speed.val();
            var direction = this.form[active].direction.val();
            if(direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null){
                direction = this.$('.' + active + '-compass')[0].settings['cardinal-angle'](direction);
            }
            var gnomeStart = webgnome.model.get('start_time');
            if(compass && speed !== '' && direction !== ''){
                this.$('.' + active + '-compass').compassRoseUI('update', {
                    speed: speed,
                    direction: direction,
                    trigger_move: false
                });
            }

            if(active === 'constant'){
                // if the constant wind pain is active a timeseries needs to be generated for the values provided
                this.model.set('timeseries', [['2013-02-13T09:00:00', [speed, direction]]]);
            }

            if (active === 'variable' && this.model.get('timeseries')[0][0] === '2013-02-13T09:00:00' && this.model.get('timeseries').length <= 1){
                speed = this.form.constant.speed.val();
                direction = this.form.constant.direction.val();
                this.form.variable.datetime.val(moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment));
                this.model.set('timeseries', [[gnomeStart, [speed, direction]]]);
                this.renderTimeseries();
            }

            this.model.set('units', this.$('#' + active + ' select[name="units"]').val());
            
            this.updateConstantSlide();
            this.updateVariableSlide();

            this.$('.additional-wind-compass').remove();

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        updateVariableSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('#variable .slider').slider('value');
            }
            var percentRange = value * 3.0;
            this.$('#variable .tooltip-inner').text('+/- ' + percentRange.toFixed(1) + ' %');
            var variableSliderMax = this.$('#variable .slider').slider("option", "max");
            this.model.set('speed_uncertainty_scale', value / (50.0 / 3));
            this.renderTimeseries(value);
            this.updateTooltipWidth();
        },

        updateConstantSlide: function(ui){
            var value;
            if (!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = !_.isNaN(this.$('#constant .slider').slider('value')) ? this.$('#constant .slider').slider('value') : 0;
            }
            if (this.model.get('timeseries').length > 0){
                var speed = this.model.get('timeseries')[0][1][0];
                var uncertainty = value / (50.0 / 3);
                if (value === 0){
                    this.$('#constant .tooltip-inner').text(speed);
                } else {
                    var rangeObj = nucos.rayleighDist().rangeFinder(speed, uncertainty);
                    this.$('#constant .tooltip-inner').text(rangeObj.low.toFixed(1) + ' - ' + rangeObj.high.toFixed(1));
                }
                var constantSliderMax = this.$('#constant .slider').slider("option", "max");
                this.model.set('speed_uncertainty_scale', uncertainty);
                this.updateTooltipWidth();
            }
        },

        constantCompassUpdate: function(magnitude, direction){
            this.form.constant.speed.val(parseInt(magnitude, 10));
            this.form.constant.direction.val(parseInt(direction, 10));
            this.update(false);
        },

        variableCompassUpdate: function(magnitude, direction){
            this.form.variable.speed.val(parseInt(magnitude, 10));
            this.form.variable.direction.val(parseInt(direction, 10));
            this.update(false);
        },

        addTimeseriesEntry: function(e){
            e.preventDefault();
            if (this.$('.additional-wind-compass').length === 0){
                var dateObj = moment(this.form.variable.datetime.val(), webgnome.config.date_format.moment);
                var date = dateObj.format('YYYY-MM-DDTHH:mm:00');
                var speed = this.form.variable.speed.val();
                var direction = this.form.variable.direction.val();
                if(direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null){
                    direction = this.$('.variable-compass')[0].settings['cardinal-angle'](direction);
                }
                var entry = [date, [speed, direction]];
                var incrementer = parseInt(this.form.variable.increment.val(), 10);

                if(this.variableFormValidation(entry)){
                    var not_replaced = true;
                    _.each(this.model.get('timeseries'), function(el, index, array){
                        if(el[0] === entry[0]){
                            not_replaced = false;
                            array[index] = entry;
                        }
                    });

                    if(not_replaced){
                        this.model.get('timeseries').push(entry);
                    }

                    // Code for time incrementer updates assuming values in form are in hours
                    dateObj.add('h', incrementer);
                    this.form.variable.datetime.val(dateObj.format(webgnome.config.date_format.moment));

                    this.renderTimeseries();
                }
                this.update();
                this.$('#variable-speed').focus().select();
            } else {

            }
        },

        modifyTimeseriesEntry: function(e){
            // Create boolean value to confirm that the DOM element clicked was the 
            // edit pencil and not the check in the table row.
            var editClassExists = this.$(e.target).hasClass('edit');
            if (this.$('.input-speed').length === 0 && editClassExists){
                e.preventDefault();
                var row = this.$(e.target).parents('tr')[0];
                var index = $(row).data('tsindex');
                var entry = this.model.get('timeseries')[index];
                var date = moment(entry[0]).format(webgnome.config.date_format.moment);
                var compiled = _.template(VarInputTemplate);
                var template = compiled({
                    'date': date,
                    'speed': entry[1][0],
                    'direction': entry[1][1]
                });
                this.$(row).addClass('edit');
                this.$(row).html(template);
                this.attachCompass(e, entry, row);
            }
        },

        clearTimeseries: function(e){
            e.preventDefault();
            var model_start_time = webgnome.model.get('start_time');
            swal({
                title: 'Are you sure?',
                text: 'This action will delete the all of the wind entries below.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: "Yes, delete it.",
                closeOnConfirm: true
            },
            _.bind(function(isConfirm){
                if (isConfirm){
                    this.model.set('timeseries', [[model_start_time, [0, 0]]]);
                    this.originalTimeseries = [[model_start_time, [0, 0]]];
                    this.renderTimeseries();
                }
            }, this));
        },

        attachCompass: function(e, entry, row){
            this.$el.off('keyup tr input');
            this.entry = entry;
            var top = (this.$('.modal-content').offset().top * -1) + this.$(row).offset().top + this.$(row).outerHeight();
            var right = 26 + "px";
            this.$('.modal-content').append('<div class="additional-wind-compass"></div>');
            this.$('.additional-wind-compass').compassRoseUI({
                    'arrow-direction': 'in',
                    'move': _.bind(this.variableRoseUpdate, this)
                });
            this.$('.additional-wind-compass').css({"position": "absolute", "right": right, "top": top});
            this.$el.on('keyup tr input', _.bind(this.writeValues, this));
            this.writeValues();
        },

        writeValues: function(){
            this.$('.additional-wind-compass').compassRoseUI('update', {
                    speed: this.$('.input-speed').val(),
                    direction: this.$('.input-direction').val()
                });
        },

        variableRoseUpdate: function(magnitude, direction){
            this.$('.input-speed').val(parseInt(magnitude, 10));
            this.$('.input-direction').val(parseInt(direction, 10));
        },

        enterTimeseriesEntry: function(e){
            e.preventDefault();
            var row = this.$(e.target).parents('tr')[0];
            var index = $(row).data('tsindex');
            var entry = this.model.get('timeseries')[index];
            var speed = this.$('.input-speed').val();
            var direction = this.$('.input-direction').val();
            var date = entry[0];
            if(direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null){
                direction = this.$('.variable-compass')[0].settings['cardinal-angle'](direction);
            }
            entry = [date, [speed, direction]];
            _.each(this.model.get('timeseries'), _.bind(function(el, index, array){
                if (el[0] === entry[0]){
                    array[index] = entry;
                    this.timeseries = array;
                }
            }, this));
            this.$('.additional-wind-compass').remove();
            this.$(row).removeClass('edit');
            this.renderTimeseries();
        },

        cancelTimeseriesEntry: function(e){
            e.preventDefault();
            var row = this.$(e.target).parents('tr')[0];
            var index = $(row).data('tsindex');
            var entry = this.model.get('timeseries')[index];
            this.renderTimeseries();
            this.$('.additional-wind-compass').compassRoseUI('update', {
                speed: entry[1][0],
                direction: entry[1][1]
            });
            this.$(row).removeClass('edit');
            this.$('.additional-wind-compass').remove();
        },

        removeTimeseriesEntry: function(e){
            if (this.$('.input-speed').length === 0){
                e.preventDefault();
                e.stopPropagation();
                var index = $(e.target.parentElement.parentElement).data('tsindex');
                this.model.get('timeseries').splice(index, 1);
                this.renderTimeseries();
            }
        },

        renderTimeseries: function(uncertainty){
            this.model.sortTimeseries();

            if(!_.isUndefined(uncertainty)){
                uncertainty = uncertainty / (50.0 / 3);
            }

            if(_.isUndefined(uncertainty)){
                uncertainty = this.$('#variable .slider').slider('value') / (50.0 / 3);
            }
            var html = '';
            _.each(this.model.get('timeseries'), function(el, index){
                var velocity = el[1][0];
                var direction = el[1][1];

                if (uncertainty > 0){
                    var rangeObj = nucos.rayleighDist().rangeFinder(velocity, uncertainty);
                    var low = rangeObj.low.toFixed(1);
                    var high = rangeObj.high.toFixed(1);
                    if (low < 0) {
                        low = 0;
                    }
                    velocity = low + ' - ' + high;
                }

                var date = moment(el[0]).format(webgnome.config.date_format.moment);
                var compiled = _.template(VarStaticTemplate);
                var template = compiled({
                    tsindex: index,
                    date: date,
                    speed: velocity,
                    direction: direction
                });
                html = html + template;
            });
            this.$('table tbody').html(html);
        },

        variableFormValidation: function(entry){
            // need to add a error presentation if something doesn't pass validation here.
            var valid = true;
            if(!this.form.variable.datetime.val() || !this.form.variable.speed.val() || !this.form.variable.direction.val()){
                valid = false;
            }
            var incrementVal = this.form.variable.increment.val();
            if(!incrementVal) {
                valid = false;
            }

            return valid;
        },

        unbindBaseMouseTrap: function(){
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.addTimeseriesEntry, this));
        },

        rebindBaseMouseTrap: function(){
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.submitByEnter, this));
        },

        variableWindStickyHeader: function(e){
            if($('.wind-form #variable table:visible').length > 0){
                var top = $('.modal').scrollTop();
                var modal_offset = $('.modal').offset();
                var offset = $('.wind-form #variable table:first').offset();
                offset.top -= modal_offset.top;

                if(offset.top < 0 && $('.wind-form .sticky').length === 0){
                    // a sticky header to the table.
                    $('<div class="sticky"><table class="table table-condensed">' + $('.wind-form #variable table:last').html() + '</table></div>').insertAfter('.wind-form #variable table');
                } else if(offset.top > 0 && $('.wind-form #variable .sticky').length > 0) {
                    // remove the sticky header from the table.
                    $('.wind-form #variable .sticky').remove();
                } else {
                    $('.wind-form #variable .sticky').css('top', top - 30 + 'px');
                }
            }
        },

        save: function(){
            if(_.isUndefined(this.nws) || !this.nws.fetching){
                FormModal.prototype.save.call(this);
            }
        },

        back: function(){
            $('.xdsoft_datetimepicker:last').remove();
            this.ol.close();
            FormModal.prototype.back.call(this);
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            $('.modal').off('scroll', this.variableWindStickyHeader);
            this.ol.close();
            FormModal.prototype.close.call(this);
        },


    });

    return windForm;
});
