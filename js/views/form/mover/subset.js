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
            this.envModel = envModel
        },

        render: function(){
            this.body = _.template(SubsetTemplate)({
                start_time: webgnome.secondsToTimeString(webgnome.model.activeTimeRange()[0]),
                end_time: webgnome.secondsToTimeString(webgnome.model.activeTimeRange()[1])
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
        },

        addCesiumHandlers: function() {

            //disable default cesium focus-on-doubleclick
            this.map.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            //single click on pin toggles popover
            this.singleClickHandler = new Cesium.ScreenSpaceEventHandler(this.map.viewer.scene.canvas);
            var singleClickHandlerFunction = _.bind(function(movement){
                var pickedObject = this.map.viewer.scene.pick(movement.position);
                this.triggerPopover(pickedObject);
                this.trigger('requestRender');
                setTimeout(_.bind(this.trigger, this), 50, 'requestRender');
            }, this);
            this.singleClickHandler.setInputAction(singleClickHandlerFunction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    });
    return subsetForm;
});