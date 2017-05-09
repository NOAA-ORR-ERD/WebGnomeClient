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
    'dropzone',
    'text!templates/default/dropzone.html',
    'views/modal/form',
    'text!templates/form/wind.html',
    'text!templates/form/wind/variable-input.html',
    'text!templates/form/wind/variable-static.html',
    'text!templates/form/wind/popover.html',
    'views/default/map',
    'model/movers/wind',
    'model/environment/wind',
    'model/resources/nws_wind_forecast',
    'compassui',
    'jqueryui/widgets/slider',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, ol, nucos, Mousetrap, swal, Dropzone, DropzoneTemplate,
    FormModal, FormTemplate, VarInputTemplate, VarStaticTemplate, PopoverTemplate, OlMapView, WindMoverModel, WindModel,
    NwsWind){
    'use strict';
    var windForm = FormModal.extend({
        title: 'Wind',
        className: 'modal form-modal wind-form',
        sliderValue: 0,
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
                'click .add-row': 'addTimeseriesRow',
                'click .undo': 'cancelTimeseriesEntry',
                'click .variable': 'unbindBaseMouseTrap',
                'click .nav-tabs li:not(.variable)': 'rebindBaseMouseTrap',
                'ready': 'rendered',
                'click .clear-winds': 'clearTimeseries',
                'keyup #nws #lat': 'nwsSubmit',
                'keyup #nws #lon': 'nwsSubmit'
            }, formModalHash);
        },

        initialize: function(options, models){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(models)) {
                this.model = models.model;
                this.superModel = models.superModel;
            } else {
                this.superModel = new WindMoverModel();
                var windModel = new WindModel();
                this.superModel.set('wind', windModel);
                this.model = this.superModel.get('wind');
            }

            if(!this.model.get('name')){
                var count = webgnome.model.get('environment').where({obj_type: this.model.get('obj_type')});
                count = !count ? 1 : count.length + 1;
                this.model.set('name', 'Wind #' + count);
            }
            
            this.title = this.model.get('name');
            this.source = new ol.source.Vector();
            this.spillSource = new ol.source.Vector();
            this.windLayer = new ol.layer.Vector({
                source: this.source,
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1.0],
                        src: '/img/map-pin.png',
                        size: [32, 40]
                    })
                })
            });
            this.spillLayer = new ol.layer.Vector({
                source: this.spillSource,
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                    anchor: [0.5, 1.0],
                    src: '/img/spill-pin.png',
                    size: [32, 40]
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#3399CC',
                        width: 1.25
                    })
                })
            });
            this.ol = new OlMapView({
                id: 'wind-form-map',
                zoom: 7,
                center: ol.proj.transform([-137.49, 47.97], 'EPSG:4326', 'EPSG:3857'),
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                                url: 'http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer',
                                params: {'LAYERS': '0', 'TILED': true}
                            })
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
                    this.windLayer,
                    this.spillLayer
                ]
            });

            this.$el.on('click', _.bind(function(e){
                var $clicked = this.$(e.target);
                if (!$clicked.hasClass('add-row') && $clicked.parents('.popover').length === 0) {
                    this.$('.popover').popover('hide');
                }
            }, this));
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                constant_datetime: moment(this.model.get('timeseries')[0][0]).format(webgnome.config.date_format.moment),
                timeseries: this.model.get('timeseries'),
                unit: this.model.get('units'),
                name: this.model.get('name')
            });
            FormModal.prototype.render.call(this, options);

            this.form = {};
            this.form.constant = {};
            this.form.constant.speed = this.$('#constant-speed');
            this.form.constant.direction = this.$('#constant-direction');
            this.form.constant.datetime = this.$('#constant-datetime');
            this.form.variable = {};
            this.form.variable.increment = this.$('#incrementCount');
            this.trigger('show');
            this.$('#constant-datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });

            this.$('#datepick').on('click', _.bind(function(){
                this.$('#constant-datetime').datetimepicker('show');
            }, this));

            this.$('select[name="units"]').find('option[value="' + this.model.get('units') + '"]').prop('selected', 'selected');
            setTimeout(_.bind(function(){
                this.$('#constant .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('#constant .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.applySpeedUncertainty(this.model.get('timeseries')[0][1][0]) + '</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateConstantSlide(ui);
                    }, this)
                });

                var constantSliderMax = this.$('#constant .slider').slider("option", "max");
                this.$('#constant .slider').slider("option", "value", this.model.get('speed_uncertainty_scale') * (50.0 / 3));
                this.updateTooltipWidth();

            }, this), 1);

            setTimeout(_.bind(function(){
                this.$('#variable .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('#variable .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">+/- ' + this.model.get('speed_uncertainty_scale') * 5.0 + ' %</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateVariableSlide(ui);
                    }, this)
                });

                var variableSliderMax = this.$('#variable .slider').slider("option", "max");
                this.$('#variable .slider').slider("option", "value", this.model.get('speed_uncertainty_scale') * (50.0 / 3));
                this.renderTimeseries();
                this.updateTooltipWidth();
                
            }, this), 1);
            //$('.modal').on('scroll', this.variableWindStickyHeader);
            $('.table-wrapper').on('scroll', this.variableWindStickyHeader);
            this.setupUpload();
            this.rendered();
            this.populateDateTime();
        },

        rendered: function(){
            if(this.model.get('timeseries').length <= 1){
                this.$('.nav-tabs a[href="#constant"]').tab('show');
            } else {
                this.unbindBaseMouseTrap();
                this.$('.nav-tabs a[href="#variable"]').tab('show');
            }
        },

        tabRendered: function(e){
            // preserve the original timeseries if one exists longer than 1 entry
            if(this.model.get('timeseries').length > 1){
                this.originalTimeseries = this.model.get('timeseries');
            }

            if(_.has(this, 'coords')){
                delete this.coords;
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

                if(!_.isUndefined(this.originalTimeseries)){
                    this.model.set('timeseries', this.originalTimeseries);
                }
                this.updateTooltipWidth();
                this.renderTimeseries();
            } else if (e.target.hash === '#nws'){
                if(this.$('#wind-form-map canvas').length === 0){
                    this.ol.render();
                    this.ol.setMapOrientation();
                    this.ol.map.on('click', _.bind(this.updateNWSMap, this));

                    var spill = webgnome.model.get('spills').at(0);
                    if (spill) {
                        var lat = spill.get('release').get('start_position')[1];
                        var lon = spill.get('release').get('start_position')[0];

                        this.$('#nws #lat').val(lat);
                        this.$('#nws #lon').val(lon);
                    }
                    this.renderSpills();
                }
            }
            this.update();
            $(window).trigger('resize');
            this.populateDateTime();
        },

        updateNWSMap: function(e){
            var coordinate, feature, coords;
            if(_.has(e, 'coordinate')){
                coordinate = new ol.geom.Point(e.coordinate);
                feature = new ol.Feature(coordinate);
                coords = new ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
                this.$('#nws #lat').val(coords[1]);
                this.$('#nws #lon').val(coords[0]);
            } else {
                coordinate = new ol.geom.Point([this.$('#nws #lon').val(), this.$('#nws #lat').val()]);
                coords = new ol.proj.transform([this.$('#nws #lon').val(), this.$('#nws #lat').val()], 'EPSG:4326', 'EPSG:3857');
                feature = new ol.Feature(new ol.geom.Point(coordinate));
            }

            this.clearError();
            this.source.forEachFeature(function(feature){
                if(feature.name !== 'spill'){
                    this.source.removeFeature(feature);
                }
            }, this);
            this.source.addFeature(feature);
            var coordObj = {lat: coords[1], lon: coords[0]};
            this.nwsFetch(coordObj);
            this.populateDateTime();
        },

        populateDateTime: function() {
            var timeseries = this.model.get('timeseries');
            var starting_time = timeseries[timeseries.length - 1][0];
            this.$('#variable-datetime').val(moment(starting_time).format(webgnome.config.date_format.moment));
        },

        renderSpills: function() {
            var spills = webgnome.model.get('spills');
            spills.forEach(function(spill){
                var start_position = spill.get('release').get('start_position');
                var end_position = spill.get('release').get('end_position');
                var geom;
                if(start_position.length > 2 && start_position[0] === end_position[0] && start_position[1] === end_position[1]){
                    start_position = [start_position[0], start_position[1]];
                    geom = new ol.geom.Point(ol.proj.transform(start_position, 'EPSG:4326', this.ol.map.getView().getProjection()));
                } else {
                    start_position = [start_position[0], start_position[1]];
                    end_position = [end_position[0], end_position[1]];
                    geom = new ol.geom.LineString([ol.proj.transform(start_position, 'EPSG:4326', this.ol.map.getView().getProjection()), ol.proj.transform(end_position, 'EPSG:4326', this.ol.map.getView().getProjection())]);
                }
                var feature = new ol.Feature({
                    geometry: geom,
                    spill: spill.get('id')
                });
                this.spillSource.addFeature(feature);
            }, this);
        },

        nwsSubmit: function(e) {
            e.preventDefault();
            var coords = {};
            coords.lat = parseFloat(this.$('#nws #lat').val());
            coords.lon = parseFloat(this.$('#nws #lon').val());
            this.updateNWSMap(e);
        },

        nwsFetch: function(coords) {
            this.nws = new NwsWind(coords);
        },

        setupUpload: function(){
            this.dropzone = new Dropzone('.dropzone', {
                url: webgnome.config.api + '/mover/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_mover',
                maxFiles: 1,
                //acceptedFiles: '.osm, .wnd, .txt, .dat',
                dictDefaultMessage: 'Drop file here to upload (or click to navigate)<br>Supported formats: all' //<code>.wnd</code>, <code>.osm</code>, <code>.txt</code>, <code>.dat</code>'
            });
            this.dropzone.on('error', _.bind(this.reset, this));
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('success', _.bind(this.loaded, this));
            this.dropzone.on('sending', _.bind(this.sending, this));
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
        },

        reset: function(file){
            setTimeout(_.bind(function(){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 10000);
        },

        progress: function(e, percent){
            if(percent === 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        loaded: function(e, response){
            var json_response = JSON.parse(response);
            this.model.set('filename', json_response.filename);
            this.model.set('name', json_response.name);
            this.model.save(null, {
                success: _.bind(function(){
                    this.trigger('save', this.model);
                    this.hide();
                }, this)
            });
        },

        nwsLoad: function(model){
            this.model.set('timeseries', model.get('timeseries'));
            this.model.set('units', model.get('units'));
            this.$('.variable a').tab('show');
            this.unbindBaseMouseTrap();
            this.$('.save').removeClass('disabled');
            this.populateDateTime();
            this.save();
        },

        nwsError: function(){
            this.error('Error!', 'No NWS forecast data found');
            this.$('.save').removeClass('disabled');
        },

        update: function(compass){
            var active = this.$('.nav-tabs:last .active a').attr('href').replace('#', '');

            if (active !== 'nws' && active !== 'variable') {
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
                    var dateObj = moment(this.form.constant.datetime.val(), webgnome.config.date_format.moment);
                    var date = dateObj.format('YYYY-MM-DDTHH:mm:00');
                    this.model.set('timeseries', [[date, [speed, direction]]]);
                    this.updateConstantSlide();
                } else {
                    this.updateVariableSlide();
                }

                this.model.set('units', this.$('#' + active + ' select[name="units"]').val());
                this.model.set('name', this.$('#name').val());
                
                
                this.$('.additional-wind-compass').remove();
            }

            if (active === 'variable') {
                var currentUnits = this.$('#' + active + ' select[name="units"]').val();
                this.$('#' + active + ' .units').text('(' + currentUnits + ')');
                this.model.set('units', this.$('#' + active + ' select[name="units"]').val());
            }
        },

        updateVariableSlide: function(ui){
            var value;
            if(this.$('#variable .ui-slider').length === 0){return null;}
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = !_.isUndefined(this.sliderValue) ? this.sliderValue : this.$('#variable .slider').slider('value');
            }
            this.sliderValue = value;
            var percentRange = this.sliderValue * 3.0;
            this.$('#variable .tooltip-inner').text('+/- ' + percentRange.toFixed(1) + ' %');
            var variableSliderMax = this.$('#variable .slider').slider("option", "max");
            this.model.set('speed_uncertainty_scale', this.sliderValue / (50.0 / 3));
            this.$('#variable .slider').slider('value', this.sliderValue);
            this.renderTimeseries(value);
            this.updateTooltipWidth();
        },

        updateConstantSlide: function(ui){
            var value;
            if(this.$('#constant .ui-slider').length === 0){return null;}
            if (!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = !_.isUndefined(this.sliderValue) ? this.sliderValue : this.$('#constant .slider').slider('value');
            }
            this.sliderValue = value;
            if (this.model.get('timeseries').length > 0){
                var speed = this.model.get('timeseries')[0][1][0];
                var uncertainty = this.sliderValue / (50.0 / 3);
                if (this.sliderValue === 0){
                    this.$('#constant .tooltip-inner').text(speed);
                } else {
                    var rangeObj = nucos.rayleighDist().rangeFinder(speed, uncertainty);
                    this.$('#constant .tooltip-inner').text(rangeObj.low.toFixed(1) + ' - ' + rangeObj.high.toFixed(1));
                }
                var constantSliderMax = this.$('#constant .slider').slider("option", "max");
                this.model.set('speed_uncertainty_scale', uncertainty);
                this.$('#constant .slider').slider('value', this.sliderValue);
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

        modifyTimeseriesEntry: function(e, rowIndex){
            // Create boolean value to confirm that the DOM element clicked was the 
            // edit pencil and not the check in the table row.
            var editClassExists = this.$(e.target).hasClass('edit');
            if ((this.$('.input-speed').length === 0 && editClassExists) || !_.isUndefined(rowIndex)) {
                var row;
                var index;
                if (editClassExists) {
                    e.preventDefault();
                    row = this.$(e.target).parents('tr')[0];
                    index = this.$(row).data('tsindex');
                } else if (!_.isUndefined(rowIndex)) {
                    index = rowIndex >= 0 ? rowIndex : 0;
                    row = this.$('[data-tsindex="' + index + '"]');
                }
                var entry = this.model.get('timeseries')[index];
                var date = moment(entry[0]).format(webgnome.config.date_format.moment);
                var compiled = _.template(VarInputTemplate);
                var template = compiled({
                    'date': date,
                    'speed': entry[1][0],
                    'direction': entry[1][1]
                });
                this.$(row).addClass('edit');
                this.$(row).removeClass('error');
                this.$(row).html(template);
                this.$(row).find('.input-time').datetimepicker({
                    format: webgnome.config.date_format.datetimepicker,
                    allowTimes: webgnome.config.date_format.half_hour_times,
                    step: webgnome.config.date_format.time_step
                });
                this.$('tr .add-row').remove();
                this.$(row).find('.input-speed').focus().val(entry[1][0]);
                this.attachCompass(e, entry, row);
            }
        },

        addRowHelper: function(e, index, newIndex, opts) {
            this.model.addTimeseriesRow(index, newIndex, opts);
            this.renderTimeseries();

            if (index - newIndex >= 0) {
                this.modifyTimeseriesEntry(e, index);
            } else {
                this.modifyTimeseriesEntry(e, newIndex);
            }
        },

        addTimeseriesRow: function(e) {
            if (this.$('.popover').length === 0) {
                var parentRow = this.$(e.target).parents('tr')[0];
                var index = this.$(parentRow).data('tsindex');
                var compiled = _.template(PopoverTemplate, {
                    tsindex: index
                });
                this.$(e.target).popover({
                    placement: 'left',
                    html: 'true',
                    title: '<span class="text-info"><strong>Add Row</strong></span>',
                    content: compiled,
                    trigger: 'click focus'
                });
                this.$(e.target).popover('show');

                var interval = this.$('#incrementCount').val();

                this.$('.above').on('click', _.bind(function(e) {
                    var newIndex = index - 1;
                    this.addRowHelper(e, index, newIndex, {'interval': interval});
                }, this));

                this.$('.below').on('click', _.bind(function(e) {
                    var newIndex = index + 1;
                    this.addRowHelper(e, index, newIndex, {'interval': interval});
                }, this));

                this.$('.popover').one('hide.bs.popover', _.bind(function(){
                    this.$('.above').off('click');
                    this.$('.below').off('click');
                }, this));
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
            }).then(_.bind(function(isConfirm){
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
            var row;
            if (e.which === 13) {
                row = this.$('tr.edit')[0];
            } else {
                row = this.$(e.target).parents('tr')[0];
            }
            if (!_.isUndefined(row)) {
                var index = $(row).data('tsindex');
                var entry = this.model.get('timeseries')[index];
                var speed = this.$('.input-speed').val();
                var direction = this.$('.input-direction').val();
                var date = moment(this.$('.input-time').val()).format('YYYY-MM-DDTHH:mm:00');
                if(direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null){
                    direction = this.$('.variable-compass')[0].settings['cardinal-angle'](direction);
                }
                entry = [date, [speed, direction]];
                var tsCopy = _.clone(this.model.get('timeseries'));
                _.each(tsCopy, _.bind(function(el, i, array){
                    if (index === i){
                        array[i] = entry;
                    }
                }, this));

                this.model.set('timeseries', tsCopy);
                this.$('.additional-wind-compass').remove();
                $('.xdsoft_datetimepicker:last').remove();
                $(row).remove();
                this.renderTimeseries();
            }
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
            $('.xdsoft_datetimepicker:last').remove();
        },

        removeTimeseriesEntry: function(e){
            if (this.$('.input-speed').length === 0){
                e.preventDefault();
                e.stopPropagation();
                var index = $(e.target.parentElement.parentElement).data('tsindex');
                this.model.get('timeseries').splice(index, 1);
                this.model.trigger('change', this.model);
                this.renderTimeseries();
            }
        },

        renderTimeseries: function(uncertainty){
            if(this.$('#variable .ui-slider').length === 0){ return null; }

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
                var compiled = _.template(VarStaticTemplate, {
                    tsindex: index,
                    date: date,
                    speed: velocity,
                    direction: direction
                });
                html = html + compiled;
            });
            this.$('table:first tbody').html(html);

            var invalidEntries = this.model.validateTimeSeries();
            _.each(invalidEntries, _.bind(function(el, index){
                this.$('[data-tsindex="' + el + '"]').addClass('error');
            }, this));
        },

        // variableFormValidation: function(entry){
        //     // need to add a error presentation if something doesn't pass validation here.
        //     var valid = true;
        //     if(!this.form.variable.datetime.val() || !this.form.variable.speed.val() || !this.form.variable.direction.val()){
        //         valid = false;
        //     }
        //     var incrementVal = this.form.variable.increment.val();
        //     if(!incrementVal) {
        //         valid = false;
        //     }

        //     return valid;
        // },

        unbindBaseMouseTrap: function(){
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.enterTimeseriesEntry, this));
        },

        rebindBaseMouseTrap: function(){
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.submitByEnter, this));
        },

        variableWindStickyHeader: function(e){
            if($('.wind-form #variable table:visible').length > 0){
                var top = $('.table-wrapper').scrollTop();

                if(top > 0 && $('.wind-form .sticky').length === 0){
                    // add a sticky header to the table.
                    $('<div class="sticky"><table class="table table-condensed">' + $('.wind-form #variable table:last').html() + '</table></div>').appendTo('.wind-form #variable .table-wrapper');
                } else if(top === 0 && $('.wind-form #variable .sticky').length > 0) {
                    // remove the sticky header from the table.
                    $('.wind-form #variable .sticky').remove();
                } else {
                    $('.wind-form #variable .sticky').css('top', top + 'px');
                }
            }
        },

        save: function(){
            if(_.isUndefined(this.nws) || this.nws.fetched){
                this.update();
                FormModal.prototype.save.call(this);
            } else {
                this.$('.save').addClass('disabled');
                this.nws.fetch({
                    success: _.bind(this.nwsLoad, this),
                    error: _.bind(this.nwsError, this)
                });
                this.nws.fetched = true;
            }
        },

        back: function(){
            $('.xdsoft_datetimepicker:last').remove();
            this.ol.close();
            FormModal.prototype.back.call(this);
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            $('.xdsoft_datetimepicker:last').remove();
            $('.modal').off('scroll', this.variableWindStickyHeader);
            
            if(this.nws){
                this.nws.cancel();
            }

            if (this.dropzone){
                this.dropzone.disable();
            }
            
            $('input.dz-hidden-input').remove();

            this.ol.close();
            FormModal.prototype.close.call(this);
        },


    });

    return windForm;
});
