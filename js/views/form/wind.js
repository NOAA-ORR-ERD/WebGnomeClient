define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'ol',
    'views/modal/form',
    'text!templates/form/wind.html',
    'views/default/map',
    'model/resources/nws_wind_forecast',
    'compassui',
    'jqueryui/slider',
    'jqueryDatetimepicker'
], function($, _, Backbone, moment, ol, FormModal, FormTemplate, olMapView, nwsWind){
    var windForm = FormModal.extend({
        title: 'Wind',
        className: 'modal fade form-modal wind-form',
        events: function(){
            return _.defaults({
                'shown.bs.modal': 'rendered',
                'shown.bs.tab': 'tabRendered',
                'click .add': 'addTimeseriesEntry',
                'click tr': 'modifyTimeseriesEntry',
                'click td span': 'removeTimeseriesEntry',
                'click .variable': 'unbindMouseTrap',
                'click .nav-tabs li:not(.variable)': 'rebindMouseTrap'
            }, FormModal.prototype.events);
        },

        initialize: function(options, GnomeWind){
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
            this.ol = new olMapView({
                id: 'wind-form-map',
                zoom: 2,
                center: [-128.6, 42.7],
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    }),
                    new ol.layer.Vector({
                        source: new ol.source.GeoJSON({
                            url: '/resource/nws_coast.json',
                            projection: 'EPSG:3857'
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
            this.trigger('show');

            this.form.constant = [];
            this.form.constant.speed = this.$('#constant-speed');
            this.form.constant.direction = this.$('#constant-direction');
            this.form.variable = [];
            this.form.variable.speed = this.$('#variable-speed');
            this.form.variable.direction = this.$('#variable-direction');
            this.form.variable.datetime = this.$('#datetime');
            this.form.variable.increment = this.$('#incrementCount');

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
            this.$('select[name="units"]').find('option[value="' + this.model.get('units') + '"]').attr('selected', 'selected');

            this.$('#constant .slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('speed') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateConstantSlide(ui);
                }, this)
            });

            this.$('#variable .slider').slider({
                min: 0,
                max: 5,
                value: 0,
                slide: _.bind(function(e, ui){
                    this.updateVariableSlide(ui);
                }, this)
            });

            this.renderTimeseries();

        },

        rendered: function(){
            if(this.model.get('timeseries').length <= 1){
                this.$('.nav-tabs a[href="#constant"]').tab('show');
            } else {
                this.$('.nav-tabs a[href="#variable"]').tab('show');
            }
        },

        tabRendered: function(e){
            if(e.target.hash == '#constant'){
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
            } else if (e.target.hash == '#variable') {
                if(this.$('.variable-compass canvas').length === 0){
                    this.$('.variable-compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.variableCompassUpdate, this)
                    });
                }
                if(this.model.get('timeseries').length == 1){
                    this.model.set('timeseries', []);
                }
                this.renderTimeseries();
            } else if (e.target.hash == '#nws'){
                if(this.$('#wind-form-map canvas').length === 0){
                    this.ol.render();
                    this.ol.map.on('click', _.bind(function(e){
                        this.source.forEachFeature(function(feature){
                            this.source.removeFeature(feature);
                        }, this);

                        var feature = new ol.Feature(new ol.geom.Point(e.coordinate));
                        var coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                        this.source.addFeature(feature);
                        this.nws = new nwsWind({lat: coords[1], lon: coords[0]});
                        this.nws.fetch();
                    }, this));
                }
            }
            this.update();
        },

        update: function(compass){
            var active = this.$('.nav-tabs .active a').attr('href').replace('#', '');
            var speed = this.form[active].speed.val();
            var direction = this.form[active].direction.val();
            if(compass && speed !== '' && direction !== ''){
                this.$('.' + active + '-compass').compassRoseUI('update', {
                    speed: speed,
                    direction: direction
                });
            }

            if(active === 'constant'){
                // if the constant wind pain is active a timeseries needs to be generated for the values provided
                this.model.set('timeseries', [['2013-02-13T09:00:00', [speed, direction]]]);
            }

            this.model.set('units', this.$('#' + active + ' select[name="units"]').val());
            
            this.updateConstantSlide();

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

            this.renderTimeseries(value);
        },

        updateConstantSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('#constant .slider').slider('value');
            }
            if(this.model.get('timeseries').length > 0){
                var speed = this.model.get('timeseries')[0][1][0];
                if(value === 0){
                    this.$('#constant .tooltip-inner').text(speed);
                } else {
                    var bottom = speed - value;
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(speed, 10) + parseInt(value, 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
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
            var dateObj = moment(this.form.variable.datetime.val(), 'YYYY/M/D H:mm');
            var date = dateObj.format('YYYY-MM-DDTHH:mm:ss');
            var speed = this.form.variable.speed.val();
            var direction = this.form.variable.direction.val();
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
                    // Code for time incrementer updates assuming values in form are in hours
                    dateObj.add('h', incrementer);
                    this.form.variable.datetime.val(dateObj.format('YYYY/M/D H:mm'));
                }
                this.renderTimeseries();
            }
            this.update();
            this.$('#variable-speed').focus();
        },

        modifyTimeseriesEntry: function(e){
            e.preventDefault();
            var index = e.target.parentElement.dataset.tsindex;
            var entry = this.model.get('timeseries')[index];
            this.form.variable.datetime.val(moment(entry[0]).format('YYYY/M/D H:mm'));
            this.form.variable.speed.val(entry[1][0]);
            this.form.variable.direction.val(entry[1][1]);
            this.$('.variable-compass').compassRoseUI('update', {
                speed: entry[1][0],
                direction: entry[1][1]
            });
        },

        removeTimeseriesEntry: function(e){
            e.preventDefault();
            e.stopPropagation();
            var index = e.target.parentElement.parentElement.dataset.tsindex;
            this.model.get('timeseries').splice(index, 1);
            this.renderTimeseries();
        },

        renderTimeseries: function(uncertainty){
            this.model.sortTimeseries();

            if(_.isUndefined(uncertainty)){
                uncertainty = this.$('#variable .slider').slider('value');
            }
            var html = '';
            _.each(this.model.get('timeseries'), function(el, index){
                var velocity = el[1][0];
                var direction = el[1][1];

                if (uncertainty > 0){
                    var low = parseInt(velocity, 10) - parseInt(uncertainty, 10);
                    var high = parseInt(uncertainty, 10) + parseInt(velocity, 10);
                    if (low < 0) {
                        low = 0;
                    }
                    velocity = low + ' - ' + high;
                }

                var date = moment(el[0]).format('YYYY/M/D H:mm');
                html = html + '<tr data-tsindex="' + index + '"><td>' + date + '</td><td>' + velocity + '</td><td>' + direction + '</td><td><span class="glyphicon glyphicon-trash"></span></td></tr>';
            });
            this.$('table tbody').html(html);
        },

        variableFormValidation: function(entry){
            var valid = true;
            if(!this.form.variable.datetime.val() || !this.form.variable.speed.val() || !this.form.variable['direction'].val()){
                valid = false;
            }
            var incrementVal = this.form.variable.increment.val();

            if(incrementVal != parseInt(incrementVal, 10)) {
                valid = false;
            }

            return valid;
        },

        unbindMouseTrap: function(){
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.addTimeseriesEntry, this));
        },

        rebindMouseTrap: function(){
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.submitByEnter, this));
        },

        next: function(){
            $('.xdsoft_datetimepicker:last').remove();
            this.ol.close();
            FormModal.prototype.next.call(this);
        },

        back: function(){
            $('.xdsoft_datetimepicker:last').remove();
            this.ol.close();
            FormModal.prototype.back.call(this);
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            this.ol.close();
            FormModal.prototype.close.call(this);
        },


    });

    return windForm;
});