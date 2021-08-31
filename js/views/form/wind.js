define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'cesium',
    'nucos',
    'mousetrap',
    'sweetalert',
    'views/default/dzone',
    'text!templates/form/wind.html',
    'text!templates/form/wind/variable-input.html',
    'text!templates/form/wind/variable-static.html',
    'text!templates/form/wind/popover.html',
    'views/cesium/cesium',
    'views/cesium/tools/nws_tool',
    'views/modal/form',
    'views/uploads/upload_folder',
    'model/visualization/graticule',
    'model/movers/wind',
    'model/environment/wind',
    'model/resources/nws_wind_forecast',
    'compassui',
    'jqueryui/widgets/slider',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, Cesium, nucos, Mousetrap, swal,
            Dzone, WindFormTemplate,
            VarInputTemplate, VarStaticTemplate, PopoverTemplate,
            CesiumView, NWSTool, FormModal, UploadFolder, Graticule,
            WindMoverModel, WindModel, NwsWind) {
    'use strict';
    var windForm = FormModal.extend({
        title: 'Point Wind',
        className: 'modal form-modal wind-form',
        sliderValue: 0,

        events: function() {
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
                'click .add-another': 'addAnotherEntry',
                'click .undo': 'cancelTimeseriesEntry',
                'click .variable': 'unbindBaseMouseTrap',
                'click .nav-tabs li:not(.variable)': 'rebindBaseMouseTrap',
                'click #extrapolation-allowed': 'setExtrapolation',
                'ready': 'rendered',
                'click .clear-winds': 'clearTimeseries',
                'focusout .lat_lon': 'moveNWSPin',
                'mouseout .cesium-viewer' : 'hidePlacement',
                'mouseover .cesium-viewer' : 'showPlacement'
            }, formModalHash);
        },

        initialize: function(options, models) {
            this.module = module;

            FormModal.prototype.initialize.call(this, options);

            if (!_.isUndefined(models)) {
                this.model = models.model;
                this.superModel = models.superModel;
            }
            else {
                this.superModel = new WindMoverModel();
                var windModel = new WindModel();
                this.superModel.set('wind', windModel);
                this.model = this.superModel.get('wind');
            }

            if (!_.isUndefined(this.superModel) &&
                    !this.superModel.get('name')) {
                var count = webgnome.model.get('environment').where({obj_type: this.model.get('obj_type')});
                count = !count ? 1 : count.length + 1;
                this.superModel.set('name', 'Wind #' + count);
                this.model.set('name', 'Wind #' + count);
            }

            this.nwsMap = new CesiumView({toolboxOptions:{defaultToolType: NWSTool}});
            this.listenTo(this.nwsMap, 'positionPicked',
                _.bind(function(coords){
                    this.nwsModel = new NwsWind(coords);
                    if (this.$('#lon').val() === '' || this.$('#lat').val() === '') {
                        this.$('#lon').val(coords.lon);
                        this.$('#lat').val(coords.lat);
                    }
                },
            this));

            this.$el.on('click', _.bind(function(e) {
                var $clicked = this.$(e.target);

                if (!$clicked.hasClass('add-row') &&
                        $clicked.parents('.popover').length === 0) {
                    this.$('.popover').popover('hide');
                }
            }, this));

            this.direction_last_appended = 'down';
            this.heldPin = null;
        },

        render: function(options) {
            var superModelName = 'Not Found';
            if (!_.isUndefined(this.superModel)) {
                superModelName = this.superModel.get('name');
            }

            this.body = _.template(WindFormTemplate)({
                constant_datetime: moment(this.model.get('timeseries')[0][0])
                                   .format(webgnome.config.date_format.moment),
                timeseries: this.model.get('timeseries'),
                unit: this.model.get('units'),
                name: superModelName,
                extrapolation_is_allowed: this.model.get('extrapolation_is_allowed')
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

            this.$('#datepick').on('click', _.bind(function() {
                this.$('#constant-datetime').datetimepicker('show');
            }, this));

            this.$('select[name="units"]').find('option[value="' + this.model.get('units') + '"]').prop('selected', 'selected');

            setTimeout(_.bind(function() {
                this.$('#constant .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function() {
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

            setTimeout(_.bind(function() {
                this.$('#variable .slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function() {
                        this.$('#variable .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">+/- ' + (this.model.get('speed_uncertainty_scale') * (50.0)).toFixed(1) + ' %</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui) {
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

            this.setupUpload(WindMoverModel.prototype.defaults.obj_type);
            this.rendered();
            this.populateDateTime();
        },

        rendered: function() {
            if (this.model.get('timeseries').length <= 1) {
                this.$('.nav-tabs a[href="#constant"]').tab('show');
            }
            else {
                this.unbindBaseMouseTrap();
                this.$('.nav-tabs a[href="#variable"]').tab('show');
            }
        },

        tabRendered: function(e) {
            // preserve the original timeseries if one exists longer than 1 entry
            if (this.model.get('timeseries').length > 1) {
                this.originalTimeseries = this.model.get('timeseries');
            }

            if (_.has(this, 'coords')) {
                delete this.coords;
            }

            if (e.target.hash === '#constant') {
                if (this.$('.constant-compass canvas').length === 0) {
                    this.$('.constant-compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.constantCompassUpdate, this)
                    });

                    this.$('.constant-compass').compassRoseUI('update', {
                        speed: this.form.constant.speed.val(),
                        direction: this.form.constant.direction.val()
                    });
                }
            }
            else if (e.target.hash === '#variable') {
                if (!_.isUndefined(this.originalTimeseries)) {
                    this.model.set('timeseries', this.originalTimeseries);
                }

                this.updateTooltipWidth();
                this.renderTimeseries();
            }
            else if (e.target.hash === '#nws') {
                if (this.$('#wind-form-map canvas').length === 0) {
                    this.$('#wind-form-map').append(this.nwsMap.$el);
                    this.nwsMap.render();
                    this.nwsPin = this.nwsMap.toolbox.currentTool.pin; //because we need to update this via lon/lat input boxes

                    //add map polygons
                    var map = webgnome.model.get('map');
                    map.getGeoJSON().then(_.bind(function(data){
                        map.processMap(data, null, this.nwsMap.viewer.scene.primitives);
                    }, this));
                    this.nwsMap.resetCamera(map);

                    //add release pins
                    var spills = webgnome.model.get('spills');
                    for (var s = 0; s < webgnome.model.get('spills').length; s++) {
                        var ds = spills.models[s].get('release').generateVis();
                        this.nwsMap.viewer.dataSources.add(ds);
                    }

                    this.$('#nws input[name="lat"]').tooltip({
                        trigger: 'focus',
                        html: true,
                        width: 200,
                        placement: 'top',
                        viewport: 'body'
                    });

                    this.$('#nws input[name="lon"]').tooltip({
                        trigger: 'focus',
                        html: true,
                        width: 200,
                        placement: 'top',
                        viewport: 'body'
                    });
                }
            }

            this.update();

            $(window).trigger('resize');

            this.populateDateTime();
        },

        moveNWSPin: function(e) {
            var coords = [this.$('#lon').val(),this.$('#lat').val()];
            if (coords[0] === '' || coords[1] === '') {
                return;
            }
            coords = this.coordsParse(_.clone(coords));
            this.$('.lat-parse').text('(' + coords[1].toFixed(4) + ')');
            this.$('.lon-parse').text('(' + coords[0].toFixed(4) + ')');
            if (_.isNaN(coords[0])) {
                coords[0] = 0;
            }

            if (_.isNaN(coords[1])) {
                coords[1] = 0;
            }
            coords = {lon: coords[0], lat: coords[1]};
            this.nwsPin.position.setValue(Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat));
            this.nwsPin.show = true;
            this.nwsMap.viewer.scene.requestRender();
            this.nwsModel = new NwsWind(coords);
        },

        hideParsedCoords: function(e) {
            this.$('.lat-parse').text('');
            this.$('.lon-parse').text('');
        },

        coordsParse: function(coordsArray) {
            for (var i = 0; i < coordsArray.length; i++) {
                if (!_.isUndefined(coordsArray[i]) &&
                        coordsArray[i].trim().indexOf(' ') !== -1) {
                    coordsArray[i] = nucos.sexagesimal2decimal(coordsArray[i]);
                    coordsArray[i] = parseFloat(coordsArray[i]);
                }
                else if (!_.isUndefined(coordsArray[i])) {
                    coordsArray[i] = parseFloat(coordsArray[i]);
                }
            }

            return coordsArray;
        },

        populateDateTime: function() {
            var timeseries = this.model.get('timeseries');
            var starting_time = timeseries[timeseries.length - 1][0];

            this.$('#variable-datetime').val(moment(starting_time).format(webgnome.config.date_format.moment));
        },

        nwsFetch: function(coords) {
            this.nwsModel = new NwsWind(coords);
            this.$('.save').addClass('disabled');
            if (this.$('#lon').val() === '' || this.$('#lat').val() === '') {
                this.$('#lon').val(coords.lon);
                this.$('#lat').val(coords.lat);
            }
            this.nwsModel.fetch({
                error: _.bind(this.nwsError, this),
                success: _.bind(this.nwsLoad, this)
            });
        },

        setupUpload: function(obj_type) {
            this.obj_type = obj_type;
            this.$('#upload_form').empty();
            this.dzone = new Dzone({
                maxFiles: 1,
                maxFilesize: webgnome.config.upload_limits.wind,  // MB
                autoProcessQueue: true,
                //gnome options
                obj_type: obj_type,
            });
            this.$('#upload_form').append(this.dzone.$el);

            this.listenTo(this.dzone, 'upload_complete', _.bind(this.loaded, this));
        },

        loaded: function(fileList) {
            $.post(webgnome.config.api + '/mover/upload',
                {'file_list': JSON.stringify(fileList),
                 'obj_type': this.obj_type,
                 'name': this.dzone.dropzone.files[0].name,
                 'session': localStorage.getItem('session')
                }
            )
            .done(_.bind(function(response) {
                var json_response = JSON.parse(response);
                var mover, editform;

                if (json_response && json_response.obj_type) {
                    if (json_response.obj_type === WindMoverModel.prototype.defaults.obj_type) {
                        mover = new WindMoverModel(json_response, {parse: true});
                    }
                    else {
                        console.error('Mover type not recognized: ', json_response.obj_type);
                    }
                    webgnome.model.get('movers').add(mover);
                    webgnome.model.get('environment').add(mover.get('wind'));

                    webgnome.model.save({},{'validate': false});
                }
                else {
                    console.error('No response to file upload');
                }

                this.hide();
            }, this)).fail(
                _.bind(this.dzone.reset, this.dzone)
            );
            //this.trigger('save');
        },

        activateFile: function(filePath) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;

                $.post('/environment/activate', {'file-name': filePath})
                .done(function(response) {
                    thisForm.loaded(filePath, response);
                });
            }
        },

        nwsLoad: function(model) {
            this.model.set('timeseries', model.get('timeseries'));
            this.model.set('units', model.get('units'));

            this.$('.variable a').tab('show');

            this.unbindBaseMouseTrap();

            this.$('.save').removeClass('disabled');

            this.populateDateTime();
            delete this.nwsModel;
        },

        nwsError: function() {
            this.error('Error!', 'No NWS forecast data found');
            this.$('.save').removeClass('disabled');
            delete this.nwsModel;
        },

        hidePlacement: function(e) {
            if (this.nwsMap) {
                this.nwsMap.toolbox.currentTool.heldEnt.show = false;
                this.nwsMap.trigger('requestRender');
            }
        },

        showPlacement: function(e) {
            if (this.nwsMap) {
                this.nwsMap.toolbox.currentTool.heldEnt.show = true;
                this.nwsMap.trigger('requestRender');
            }
        },

        update: function(compass) {
            var active = this.$('.nav-tabs.wind .active a').attr('href').replace('#', '');

            if (active === 'constant') {
                var speed = this.form[active].speed.val();
                var direction = this.form[active].direction.val();

                if (direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null) {
                    direction = this.$('.' + active + '-compass')[0].settings['cardinal-angle'](direction);
                }

                var gnomeStart = webgnome.model.get('start_time');

                if (compass && speed !== '' && direction !== '') {
                    this.$('.' + active + '-compass').compassRoseUI('update', {
                        speed: speed,
                        direction: direction,
                        trigger_move: false
                    });
                }

                // if the constant wind pane is active, a timeseries
                // needs to be generated for the values provided
                var dateObj = moment(this.form.constant.datetime.val(),
                                     webgnome.config.date_format.moment);
                var date = dateObj.format('YYYY-MM-DDTHH:mm:00');

                this.model.set('timeseries', [[date, [speed, direction]]]);
                this.updateConstantSlide();


                this.model.set('units', this.$('#' + active + ' select[name="units"]').val());
                this.model.set('name', this.$('#name').val());
                this.superModel.set('name', this.$('#name').val());

                this.$('.additional-wind-compass').remove();
            }

            if (active === 'variable') {
                var currentUnits = this.$('#' + active + ' select[name="units"]').val();

                this.$('#' + active + ' .units').text('(' + currentUnits + ')');
                this.model.set('units', this.$('#' + active + ' select[name="units"]').val());
                this.model.set('name', this.$('#name').val());
                this.superModel.set('name', this.$('#name').val());
            }
        },

        updateVariableSlide: function(ui) {
            var value;

            if (this.$('#variable .ui-slider').length === 0) {return null;}

            if (!_.isUndefined(ui)) {
                value = ui.value;
            }
            else {
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

        updateConstantSlide: function(ui) {
            var value;

            if (this.$('#constant .ui-slider').length === 0) {return null;}

            if (!_.isUndefined(ui)) {
                value = ui.value;
            }
            else {
                value = !_.isUndefined(this.sliderValue) ? this.sliderValue : this.$('#constant .slider').slider('value');
            }

            this.sliderValue = value;

            if (this.model.get('timeseries').length > 0) {
                var speed = this.model.get('timeseries')[0][1][0];
                var uncertainty = this.sliderValue / (50.0 / 3);

                if (this.sliderValue === 0) {
                    this.$('#constant .tooltip-inner').text(speed);
                }
                else {
                    var rangeObj = nucos.rayleighDist().rangeFinder(speed, uncertainty);
                    this.$('#constant .tooltip-inner').text(rangeObj.low.toFixed(1) + ' - ' + rangeObj.high.toFixed(1));
                }

                var constantSliderMax = this.$('#constant .slider').slider("option", "max");

                this.model.set('speed_uncertainty_scale', uncertainty);
                this.$('#constant .slider').slider('value', this.sliderValue);

                this.updateTooltipWidth();
            }
        },

        constantCompassUpdate: function(magnitude, direction) {
            this.form.constant.speed.val(parseInt(magnitude, 10));
            this.form.constant.direction.val(parseInt(direction, 10));
            this.update(false);
        },

        variableCompassUpdate: function(magnitude, direction) {
            this.form.variable.speed.val(parseInt(magnitude, 10));
            this.form.variable.direction.val(parseInt(direction, 10));
            this.update(false);
        },

        modifyTimeseriesEntry: function(e, rowIndex) {
            // Create boolean value to confirm that the DOM element clicked
            // was the  edit pencil and not the check in the table row.
            var editClassExists = this.$(e.target).hasClass('edit');

            if ((this.$('.input-speed').length === 0 && editClassExists) ||
                    !_.isUndefined(rowIndex)) {
                var row;
                var index;

                if (editClassExists) {
                    e.preventDefault();
                    row = this.$(e.target).parents('tr')[0];
                    index = this.$(row).data('tsindex');
                }
                else if (!_.isUndefined(rowIndex)) {
                    index = rowIndex >= 0 ? rowIndex : 0;
                    row = this.$('[data-tsindex="' + index + '"]');
                }

                var entry = this.model.get('timeseries')[index];
                var date = moment(entry[0]).format(webgnome.config.date_format.moment);

                var compiled = _.template(VarInputTemplate);
                var template = compiled({
                    'date': date,
                    'speed': webgnome.largeNumberFormatter(entry[1][0]),
                    'direction': webgnome.largeNumberFormatter(entry[1][1])
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
                this.direction_last_appended = 'up';
            }
            else {
                this.modifyTimeseriesEntry(e, newIndex);
                this.direction_last_appended = 'down';
            }
        },

        addTimeseriesRow: function(e) {
            if (this.$('.popover').length === 0) {
                var parentRow = this.$(e.target).parents('tr')[0];
                var index = this.$(parentRow).data('tsindex');

                var compiled = _.template(PopoverTemplate)({
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
                    this.direction_last_appended = 'up';
                }, this));

                this.$('.below').on('click', _.bind(function(e) {
                    var newIndex = index + 1;
                    this.addRowHelper(e, index, newIndex, {'interval': interval});
                    this.direction_last_appended = 'down';
                }, this));

                this.$('.popover').one('hide.bs.popover', _.bind(function() {
                    this.$('.above').off('click');
                    this.$('.below').off('click');
                }, this));
            }
        },

        clearTimeseries: function(e) {
            e.preventDefault();
            var model_start_time = webgnome.model.get('start_time');

            swal({
                title: 'Are you sure?',
                text: 'This action will delete the all of the wind entries below.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: "Yes, delete it.",
                closeOnConfirm: true
            }).then(_.bind(function(isConfirm) {
                if (isConfirm) {
                    this.model.set('timeseries', [[model_start_time, [0, 0]]]);
                    this.originalTimeseries = [[model_start_time, [0, 0]]];
                    this.renderTimeseries();
                }
            }, this));
        },

        attachCompass: function(e, entry, row) {
            this.$el.off('keyup tr input');
            this.entry = entry;

            var top = (this.$('.modal-content').offset().top * -1) + this.$(row).offset().top + this.$(row).outerHeight();
            var right = 26 + "px";

            this.$('.modal-content').append('<div class="additional-wind-compass"></div>');

            this.$('.additional-wind-compass').compassRoseUI({
                    'arrow-direction': 'in',
                    'move': _.bind(this.variableRoseUpdate, this)
                });

            this.$('.additional-wind-compass').css({"position": "absolute",
                                                    "right": right,
                                                    "top": top});
            this.$el.on('keyup tr input', _.bind(this.writeValues, this));

            this.writeValues();
        },

        writeValues: function() {
            var direction = this.$('.input-direction').val();

            if (direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null) {
                direction = this.$('.additional-wind-compass')[0].settings['cardinal-angle'](direction);
            }

            this.$('.additional-wind-compass').compassRoseUI('update', {
                speed: this.$('.input-speed').val(),
                direction: direction
            });
        },

        variableRoseUpdate: function(magnitude, direction) {
            this.$('.input-speed').val(parseInt(magnitude, 10));
            this.$('.input-direction').val(parseInt(direction, 10));
        },

        enterTimeseriesEntry: function(e) {
            e.preventDefault();
            var row;

            if (e.which === 13) {
                row = this.$('tr.edit')[0];
            }
            else {
                row = this.$(e.target).parents('tr')[0];
            }

            if (!_.isUndefined(row)) {
                var index = $(row).data('tsindex');
                var entry = this.model.get('timeseries')[index];
                var speed = this.$('.input-speed').val();
                var direction = this.$('.input-direction').val();

                var date = moment(this.$('.input-time').val(),
                                  'YYYY/MM/DD HH:mm').format('YYYY-MM-DDTHH:mm:00');

                if (direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null) {
                    direction = this.$('.additional-wind-compass')[0].settings['cardinal-angle'](direction);
                }

                entry = [date, [speed, direction]];
                var tsCopy = _.clone(this.model.get('timeseries'));

                _.each(tsCopy, _.bind(function(el, i, array) {
                    if (index === i) {
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

        addAnotherEntry: function(e) {
            e.preventDefault();
            var row;

            if (e.which === 13) {
                row = this.$('tr.edit')[0];
            }
            else {
                row = this.$(e.target).parents('tr')[0];
            }

            var index;

            if (!_.isUndefined(row)) {
                index = $(row).data('tsindex');

                var entry = this.model.get('timeseries')[index];
                var speed = this.$('.input-speed').val();
                var direction = this.$('.input-direction').val();

                var date = moment(this.$('.input-time').val(),
                                  'YYYY/MM/DD HH:mm').format('YYYY-MM-DDTHH:mm:00');

                if (direction.match(/[s|S]|[w|W]|[e|E]|[n|N]/) !== null) {
                    direction = this.$('.additional-wind-compass')[0].settings['cardinal-angle'](direction);
                }

                entry = [date, [speed, direction]];

                var tsCopy = _.clone(this.model.get('timeseries'));
                _.each(tsCopy, _.bind(function(el, i, array) {
                    if (index === i) {
                        array[i] = entry;
                    }
                }, this));

                this.model.set('timeseries', tsCopy);
                this.$('.additional-wind-compass').remove();

                $('.xdsoft_datetimepicker:last').remove();
                //$(row).remove();
                //this.renderTimeseries();
            }

            var parentRow = this.$(e.target).parents('tr')[0];
            index = this.$(parentRow).data('tsindex');

            var interval = this.$('#incrementCount').val();
            var nextIndex = index + 1;

            if (this.direction_last_appended === 'up') {
                nextIndex = index - 1;
            }

            this.addRowHelper(e, index, nextIndex, {'interval': interval});

        },

        cancelTimeseriesEntry: function(e) {
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

        removeTimeseriesEntry: function(e) {
            if (this.$('.input-speed').length === 0) {
                e.preventDefault();
                e.stopPropagation();
                var model_start_time = webgnome.model.get('start_time');
                var index = $(e.target.parentElement.parentElement).data('tsindex');
                this.model.get('timeseries').splice(index, 1);
                this.model.trigger('change', this.model);
                if(this.model.get('timeseries').length === 0){
                    this.model.set('timeseries', [[model_start_time, [0, 0]]]);
                }
                this.renderTimeseries();
            }
        },

        renderTimeseries: function(uncertainty) {
            if (this.$('#variable .ui-slider').length === 0) {return null;}

            if (!_.isUndefined(uncertainty)) {
                uncertainty = uncertainty / (50.0 / 3);
            }

            if (_.isUndefined(uncertainty)) {
                uncertainty = this.$('#variable .slider').slider('value') / (50.0 / 3);
            }

            var html = '';

            _.each(this.model.get('timeseries'), function(el, index) {
                var velocity = el[1][0];
                var direction = el[1][1];

                if (uncertainty > 0) {
                    var rangeObj = nucos.rayleighDist().rangeFinder(velocity, uncertainty);
                    var low = rangeObj.low.toFixed(1);
                    var high = rangeObj.high.toFixed(1);

                    if (low < 0) {
                        low = 0;
                    }

                    velocity = low + ' - ' + high;
                }

                var date = moment(el[0]).format(webgnome.config.date_format.moment);

                var compiled = _.template(VarStaticTemplate)({
                    tsindex: index,
                    date: date,
                    speed: velocity,
                    direction: direction
                });

                html = html + compiled;
            });

            this.$('table:first tbody').html(html);

            var invalidEntries = this.model.validateTimeSeries();

            _.each(invalidEntries, _.bind(function(el, index) {
                this.$('[data-tsindex="' + el + '"]').addClass('error');
            }, this));
        },

        unbindBaseMouseTrap: function() {
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.enterTimeseriesEntry, this));
        },

        rebindBaseMouseTrap: function() {
            Mousetrap.unbind('enter');
            Mousetrap.bind('enter', _.bind(this.submitByEnter, this));
        },

        variableWindStickyHeader: function(e) {
            if ($('.wind-form #variable table:visible').length > 0) {
                var top = $('.table-wrapper').scrollTop();

                if (top > 0 && $('.wind-form .sticky').length === 0) {
                    // add a sticky header to the table.
                    $('<div class="sticky"><table class="table table-condensed">' + $('.wind-form #variable table:last').html() + '</table></div>').appendTo('.wind-form #variable .table-wrapper');
                }
                else if (top === 0 && $('.wind-form #variable .sticky').length > 0) {
                    // remove the sticky header from the table.
                    $('.wind-form #variable .sticky').remove();
                }
                else {
                    $('.wind-form #variable .sticky').css('top', top + 'px');
                }
            }
        },

        setExtrapolation: function(e) {
            var selected = $(e.target).is(':checked');
            this.model.set('extrapolation_is_allowed', selected);
        },

        save: function() {
            if (_.isUndefined(this.nwsModel) || this.nwsModel.fetched) {
                //this.update();

                FormModal.prototype.save.call(this);
            }
            else {
                this.$('.save').addClass('disabled');

                this.nwsModel.fetch({
                    success: _.bind(this.nwsLoad, this),
                    error: _.bind(this.nwsError, this)
                });

                this.nwsModel.fetched = true;
            }
        },

        back: function() {
            $('.xdsoft_datetimepicker:last').remove();

            FormModal.prototype.back.call(this);
        },

        close: function() {
            $('.xdsoft_datetimepicker:last').remove();
            $('.xdsoft_datetimepicker:last').remove();
            $('.modal').off('scroll', this.variableWindStickyHeader);

            if (this.nws) {
                this.nws.cancel();
            }

            if (this.dzone) {
                this.dzone.close();
            }

            FormModal.prototype.close.call(this);
        },
    });

    return windForm;
});
