define([
    'underscore',
    'jquery',
    'cesium',
    'module',
    'model/movers/py_current',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'text!templates/form/mover/subset.html',
    'text!templates/form/mover/goods_cast_metadata.html',
    'model/resources/shorelines',
    'model/visualization/envConditionsModel',
    'collection/envConditionsCollection'
], function(_, $, Cesium, module, PyCurrentMover, FormModal,
    CesiumView, RectangleTool, SubsetTemplate, MetadataTemplate, ShorelineResource,
    EnvConditionsModel, EnvConditionsCollection){
    
    var subsetForm = FormModal.extend({
        title: 'Subset Form',
        className: 'modal form-modal goods-subset',
        events: function() {
            return _.defaults({
                //'click .item': 'pickModelFromList',
            }, FormModal.prototype.events);
        },

        initialize: function(options, envModel){
            this.module = module;
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            this.envModel = envModel;
            this.wb = this.envModel.get('bounding_box')[0];
            this.nb = this.envModel.get('bounding_box')[1];
            this.eb = this.envModel.get('bounding_box')[2];
            this.sb = this.envModel.get('bounding_box')[3];
        },

        render: function(){
            this.body = _.template(SubsetTemplate)({
                start_time: webgnome.secondsToTimeString(webgnome.model.activeTimeRange()[0]),
                end_time: webgnome.secondsToTimeString(webgnome.model.activeTimeRange()[1]),
                bounds: [webgnome.largeNumberFormatter(this.wb),
                         webgnome.largeNumberFormatter(this.nb),
                         webgnome.largeNumberFormatter(this.eb),
                         webgnome.largeNumberFormatter(this.sb)
                ]

            });
            FormModal.prototype.render.call(this);
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
                    this.map.resetCamera(model_map);
                }, this));
                
            }

            //add release visualizations
            var spills = webgnome.model.get('spills').models;
            for (var i = 0; i < spills.length; i++){
                this.map.viewer.dataSources.add(spills[i].get('release').generateVis());
            }
            this.envModel.produceBoundsPolygon(this.map.viewer);
            this.addCesiumHandlers();
            this.map.resetCamera(this.envModel);
            this.listenTo(this.map, 'endRectangle', this.updateBounds);
            this.listenTo(this.map, 'resetRectangle', this.updateBounds);

            /*
            this.$('#subset_start_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate:  webgnome.secondsToTimeString(webgnome.model.activeTimeRange()[0]),
            });
            

            this.$('#subset_end_time').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate:  "1970/01/01",
                yearStart: "1970",
            });
            */
        },

        updateBounds: function(activePoints) {
            if (activePoints.length === 0) {
                this.wb = this.envModel.get('bounding_box')[0];
                this.nb = this.envModel.get('bounding_box')[1];
                this.eb = this.envModel.get('bounding_box')[2];
                this.sb = this.envModel.get('bounding_box')[3];
            } else {
                var bounds = Cesium.Rectangle.fromCartesianArray(activePoints);    
                this.wb = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.west));
                this.nb = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.north));
                this.eb = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.east));
                this.sb = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.south));
            }
            this.$('#wb').val(webgnome.largeNumberFormatter(this.wb));
            this.$('#nb').val(webgnome.largeNumberFormatter(this.nb));
            this.$('#eb').val(webgnome.largeNumberFormatter(this.eb));
            this.$('#sb').val(webgnome.largeNumberFormatter(this.sb));

        },

        addCesiumHandlers: function() {

            //disable default cesium focus-on-doubleclick
            this.map.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
    });
    return subsetForm;
});