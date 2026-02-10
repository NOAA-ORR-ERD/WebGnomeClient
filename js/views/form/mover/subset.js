define([
    'underscore',
    'jquery',
    'module',
    'moment',
    'model/movers/py_current',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'views/form/map/goods',
    'text!templates/form/mover/subset.html',
    'text!templates/form/mover/goods_cast_metadata.html',
    'model/visualization/envConditionsModel',
    'collection/envConditionsCollection',
    'model/environment/tzoffset',
], function(_, $, module, moment, PyCurrentMover, FormModal,
    CesiumView, RectangleTool, GoodsMapForm, SubsetTemplate, MetadataTemplate,
    EnvConditionsModel, EnvConditionsCollection, TZOffsetObj){

    var subsetForm = FormModal.extend({
        title: 'Subset Form',
        className: 'modal form-modal goods-subset',
        buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="submit">Submit</button>',
        events: function() {
            return _.defaults({
                'click .submit': 'submit',
                'click .cancel': 'cancel',
                'change #wb': 'inputToMap',
                'change #sb': 'inputToMap',
                'change #eb': 'inputToMap',
                'change #nb': 'inputToMap',
                'change #subset_start_time': 'timeOptionsStyling',
                'change #subset_end_time': 'timeOptionsStyling',
                'change #adjust_tz': 'timeOptionsStyling',
            }, FormModal.prototype.events);
        },

        initialize: function(options, envModel){
            this.module = module;
            //this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            this.request_type = options.request_type;
            this.ignore_map_bounds = options.ignore_map_bounds;
            this.envModel = envModel;
            this.setInitialBounds();
            this.title = 'Subset Form - ' + this.envModel.get('name') + ' ' + this.request_type;
        },

        setInitialBounds: function() {
            var map = webgnome.model.get('map');
            if (map.get('obj_type') !== 'gnome.maps.map.GnomeMap' && !this.ignore_map_bounds){
                var rect = map.getBoundingRectangle(false);
                this.wb = Cesium.Math.toDegrees(rect.west);
                this.sb = Cesium.Math.toDegrees(rect.south);
                this.eb = Cesium.Math.toDegrees(rect.east);
                this.nb = Cesium.Math.toDegrees(rect.north);
            } else {
                this.wb = this.envModel.get('bounding_box')[0];
                this.sb = Cesium.Math.clamp(this.envModel.get('bounding_box')[1], -89.5, 89.5);
                this.eb = this.envModel.get('bounding_box')[2];
                this.nb = Cesium.Math.clamp(this.envModel.get('bounding_box')[3], -89.5, 89.5);
            }
        },

        render: function(){

            var duration = webgnome.model.get('duration');
            var start_time = moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment);
            var start_time_seconds = webgnome.timeStringToSeconds(webgnome.model.get('start_time'));
            var end_time = moment(webgnome.secondsToTimeString(start_time_seconds+duration)).format(webgnome.config.date_format.moment);
            var backwards = webgnome.model.get('run_backwards');
            if(backwards) {
                var temp = start_time;
                start_time = end_time;
                end_time = temp;
            }

            var model_timezone_offset = webgnome.model.get('timezone_offset');
            //var timezone_offset = (_.isNull(model_timezone_offset.get('offset'))) ? new TZOffsetObj({offset:0, title:'UTC'}):model_timezone_offset;

            this.body = _.template(SubsetTemplate)({
                start_time: start_time,
                end_time: end_time,
                bounds: [webgnome.largeNumberFormatter(this.wb),
                         webgnome.largeNumberFormatter(this.nb),
                         webgnome.largeNumberFormatter(this.eb),
                         webgnome.largeNumberFormatter(this.sb)
                ],
                wizard: this.options.wizard,
                actual_start: this.envModel.get('actual_start'),
                actual_end: this.envModel.get('actual_end'),
                tz_select: this.genTimeZoneSelect(),
            });
            FormModal.prototype.render.call(this);

            if (this.ignore_map_bounds) {
                this.$('#include-map')[0].checked = true;
            }

            this.$('#subset_start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate: this.envModel.get('actual_start'),
                maxDate: this.envModel.get('actual_end'),
            });

            this.$('#subset_end_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                minDate: this.envModel.get('actual_start'),
                maxDate: this.envModel.get('actual_end'),
            });

            this.$('.popover').hide();

            this.map = new CesiumView({
                baseLayerPicker: true,
                toolboxOptions:{defaultToolType: RectangleTool}
            });
            this.$('#shoreline-goods-subset-map').append(this.map.$el);
            this.map.render();

            //add and focus map, if available
            var model_map = webgnome.model.get('map');
            if(model_map.get('obj_type') !== 'gnome.maps.map.GnomeMap'){
                model_map.getGeoJSON().then(_.bind(function(data){
                    model_map.processMap(data, null, this.map.viewer.scene.primitives);
                }, this));
            }

            //add release visualizations
            var spills = webgnome.model.get('spills').models;
            for (var i = 0; i < spills.length; i++){
                this.map.viewer.dataSources.add(spills[i].get('release').generateVis());
            }
            if (!this.envModel.isGlobal()){
                this.envModel.produceBoundsPolygon(this.map.viewer);
            }
            this.addCesiumHandlers();
            if (model_map.get('obj_type') !== 'gnome.maps.map.GnomeMap' && !this.ignore_map_bounds) {
                this.map.resetCamera(model_map);
            } else {
                this.map.resetCamera(this.envModel);
            }

            //draw initial rectangle before listeners
            this.map.toolbox.currentTool.drawRectFromBounds([this.wb, this.sb, this.eb, this.nb]);
            if (this.envModel.isGlobal() && model_map.get('obj_type') === 'gnome.maps.map.GnomeMap'){
                //hide red box if subsetting a global model without a map yet
                this.map.toolbox.currentTool.heldEnt.show = false;
            }

            if (this.request_type === 'winds') {
                this.$('#current-options').hide();
            } else {
                if (!this.envModel.get('env_params').includes('surface winds')){
                    this.$('#included-winds-label').hide();
                    this.$('#included-winds').parent().hide();
                }
            }

            this.listenTo(this.map, 'endRectangle', this.updateBounds);
            //this.listenTo(this.map, 'resetRectangle', this.updateBounds);
        },

        update: function(e){
            if (e) {
                FormModal.prototype.update.call(this, e);
            }
            var timeoffset = this.$('#timeoffset');
            var model_time_offset = webgnome.model.get('timezone_offset');
            if (!_.isNull(timeoffset)){
                model_time_offset.set('offset', parseFloat(timeoffset.val()));
                model_time_offset.set('title', this.$('#timeoffset option:selected').text());
            } else {
                model_time_offset.set('offset', null);
                model_time_offset.set('title', 'No Timezone Specified');
            }
            webgnome.model.set('timezone_offset', model_time_offset);

        },

        updateBounds: function(activePoints) {
            if (activePoints.length === 0) {
                this.wb = this.envModel.get('bounding_box')[0];
                this.nb = Cesium.Math.clamp(this.envModel.get('bounding_box')[3], -89.5, 89.5);
                this.eb = this.envModel.get('bounding_box')[2];
                this.sb = Cesium.Math.clamp(this.envModel.get('bounding_box')[1], -89.5, 89.5);
            } else {
                var bounds = Cesium.Rectangle.fromCartesianArray(activePoints);
                this.wb = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.west));
                this.nb = Cesium.Math.toDegrees(Cesium.Math.clamp(bounds.north, -89.5, 89.5));
                this.eb = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.east));
                this.sb = Cesium.Math.toDegrees(Cesium.Math.clamp(bounds.south, -89.5, 89.5));
            }
            this.$('#wb').val(webgnome.largeNumberFormatter(this.wb));
            this.$('#nb').val(webgnome.largeNumberFormatter(this.nb));
            this.$('#eb').val(webgnome.largeNumberFormatter(this.eb));
            this.$('#sb').val(webgnome.largeNumberFormatter(this.sb));

        },

        inputToMap: function(e) {
            var boundName = e.currentTarget.id;
            this[boundName] = parseFloat(e.currentTarget.value);
            var boundsArray = [this.wb, this.sb, this.eb, this.nb];
            this.map.toolbox.currentTool.drawRectFromBounds(boundsArray);
            this.map.trigger('requestRender');
        },

        addCesiumHandlers: function() {

            //disable default cesium focus-on-doubleclick
            this.map.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        },

        timeOptionsStyling: function(e) {
            var offset = this.$('#timeoffset').val();
            var st = moment(this.$('#subset_start_time').val()).subtract(offset,'hour');
            var et = moment(this.$('#subset_end_time').val()).subtract(offset,'hour');
            var ast = moment(this.envModel.get('actual_start'));
            var aet = moment(this.envModel.get('actual_end'));
            if (st < ast || st > aet || st > et){
                this.$('#subset_start_time').css('color', 'red');
            } else {
                this.$('#subset_start_time').css('color', 'black');
            }
            if (et < st || et < ast){
                this.$('#subset_end_time').css('color', 'red');
            } else {
                this.$('#subset_end_time').css('color', 'black');
            }

        },

        validate: function(reqOpts) {
            //Basic time validation only. Bounds checking is done on the server
            var st = moment(reqOpts.start_time);
            var et = moment(reqOpts.end_time);
            var ast = moment(this.envModel.get('actual_start'));
            var aet = moment(this.envModel.get('actual_end'));
            var success = true;
            if (et < st || et < ast){
                this.error('Requested end time is before requested start time.');
                success = false;
            } else if (et < ast){
                this.error('Requested end time is before available start time.');
                success = false;
            }
            if (st < ast || st > aet){
                this.error('Requested start time is outside the available interval.');
                success = false;
            }
            return success;

        },

        mapRequest: function(xDateline) {
            var newRequest = {
            NorthLat: Cesium.Math.clamp(this.nb, -89.5, 89.5),
            WestLon: this.wb,
            EastLon: this.eb,
            SouthLat: Cesium.Math.clamp(this.sb, -89.5, 89.5),
            xDateline: xDateline,
            shoreline: 'gshhs',
            resolution: 'f',
            submit: 'Get Map',
           };

           $.post(webgnome.config.api+'/goods/maps',
           newRequest
           ).done(
               GoodsMapForm.prototype.mapObjRequestFunc
           ).fail(_.bind(function(resp, a, b, c){
                    //error func for /goods/ POST
                   console.error(a);
                }, this)
           );

        },

        submit: function(e) {
            e.preventDefault();
            this.lockControls();

            if (this.map.toolbox.currentTool.drawMode) {
                this.map.toolbox.currentTool.endRectangle(null);
                //Although listener will be triggered by endRectangle we need
                //to do an immediate synchronous update.
                this.updateBounds(this.map.toolbox.currentTool.activePoints);
            }

            var model_id =  this.envModel.get('identifier');
            var source = this.envModel.get('source');
            var mapIncluded = this.$('#include-map')[0].checked;
            var xDateline = 0;
            if (this.wb > this.eb) {
                //crossing dateline
                xDateline = 1;
                this.eb = this.eb + 360.0
            }
            if (mapIncluded) {
                this.mapRequest(xDateline);
            }

            var timeoffset = parseFloat(this.$('#timeoffset').val());
            var timeoffset_name = this.$('#timeoffset option:selected').text();

            var timezone_offset = new TZOffsetObj({offset:timeoffset, title:timeoffset_name});
            webgnome.model.set('timezone_offset',timezone_offset);
            webgnome.model.save();
            timeoffset = (!_.isNull(timeoffset)) ? parseFloat(timeoffset):0;
            //these are just used to bound the subset in time, so we are converting from desired time zone "local" to UTC
            var st = moment(this.$('#subset_start_time').val()).subtract(timeoffset,'hour').format('YYYY-MM-DDTHH:mm:ss');
            var et = moment(this.$('#subset_end_time').val()).subtract(timeoffset,'hour').format('YYYY-MM-DDTHH:mm:ss');

            var surf = this.$('#surface')[0].checked;
            var includeWinds = this.$('#included-winds')[0].checked;
            //var source = $('input:radio[name=source]:checked').val();
            var req_typ;
            if (surf){
                req_typ = 'surface ' + this.request_type;
            } else {
                req_typ = '3D ' + this.request_type;
            }
            var req_opts =
            {session: localStorage.getItem('session'),
            command: 'create',
            model_id: model_id,
            NorthLat: Cesium.Math.clamp(this.nb, -89.5, 89.5),
            WestLon: this.wb,
            EastLon: this.eb,
            SouthLat: Cesium.Math.clamp(this.sb, -89.5, 89.5),
            start_time: st,
            end_time: et,
            surface_only: surf,
            cross_dateline: xDateline,
            source: source,
            include_winds: includeWinds,
            request_type: req_typ,
            };
            if (this.validate(req_opts)) {
                $.get(
                    webgnome.config.api+'/goods/validation',
                    req_opts,
                    undefined,
                    'json'
                ).done(_.bind(function(resp){
                    $.post(
                        webgnome.config.api+'/goods_requests',
                        req_opts
                    ).done(_.bind(function(request_obj){
                        console.log(request_obj);
                        webgnome.getGoodsRequests(null, true).then(
                            _.bind(function(res){
                                webgnome.model.trigger('save');
                                this.trigger('success', req_opts);
                                this.unlockControls();
                                this.hide();
                                this.close();
                            }, this)
                        );
                        }, this)
                    ).fail(
                        _.bind(function(resp){
                            this.error(resp);
                            this.unlockControls();
                        }, this)
                    );
                    this.lockControls();
                }, this)).fail(
                    _.bind(function(resp){
                        this.error(resp);
                        this.unlockControls();
                    }, this)
                );

            } else {
                this.unlockControls();
            }
        },

        close: function() {
            this.$('#subset_start_time').datetimepicker('destroy');
            this.$('#subset_end_time').datetimepicker('destroy');
            FormModal.prototype.close.call(this);
        },

        wizardcancel: function() {
            this.$('#subset_start_time').datetimepicker('destroy');
            this.$('#subset_end_time').datetimepicker('destroy');
            FormModal.prototype.wizardcancel.call(this);
        },

        hide: function() {
            FormModal.prototype.hide.call(this);
        }
    });
    return subsetForm;
});
