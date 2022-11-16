define([
    'underscore',
    'jquery',
    'cesium',
    'module',
    'model/movers/py_current',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'text!templates/form/mover/goods.html',
    'text!templates/form/mover/goods_cast_metadata.html',
    'views/form/mover/subset',
    'model/resources/shorelines',
    'model/visualization/envConditionsModel',
    'collection/envConditionsCollection'
], function(_, $, Cesium, module, PyCurrentMover, FormModal,
    CesiumView, RectangleTool, GoodsTemplate, MetadataTemplate, SubsetForm, ShorelineResource,
    EnvConditionsModel, EnvConditionsCollection){
    
    var goodsMoverForm = FormModal.extend({
        title: 'Select Model',
        className: 'modal form-modal goods-map',
        events: function() {
            return _.defaults({
                'click .item': 'pickModelFromList',
                'click .popover-subset-button': 'subsetModel',
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            if (webgnome.isUorN(options.request_type) || options.request_type === 'currents'){
                this.request_type = 'currents';
                this.title = 'Select Ocean Model';
            } else {
                this.request_type = options.request_type;
                this.title = 'Select Wind Model';
            }
        },

        render: function(){
            this.body = _.template(GoodsTemplate)();
            FormModal.prototype.render.call(this);
            this.$('.save').hide();
            this.$('.popover').hide();
            
            this.map = new CesiumView({
                baseLayerPicker: true,
                //toolboxOptions:{defaultToolType: RectangleTool}
            });
            this.$('#shoreline-goods-map').append(this.map.$el);
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

            this.envModels = new EnvConditionsCollection();
            this.modelBoundaries = [];
            var req_typ;
            if (this.request_type === 'currents') {
                req_typ = ['surface currents', '3D currents'];
            } else {
                req_typ = ['surface winds'];
            }
            this.envModels.getBoundedList(model_map, req_typ).then(
                _.bind(function(mod){
                    for (var i = 0; i < mod.length; i++){
                        var listEntry = $('<div class="item"></div');
                        listEntry.html(mod.models[i].get('name'));
                        if (!mod.models[i].get('regional')){
                            this.$('#regionalModelsHeader').after(listEntry);
                            this.modelBoundaries.push(mod.models[i].produceBoundsPolygon(this.map.viewer));
                        } else {
                            this.$('#globalModelsHeader').after(listEntry);
                        }
                    }
                    this.addCesiumHandlers();
                }, this)
            );
            
        },

        pickModelFromList: function(e) {
            var tgt = $(e.currentTarget);
            var name = tgt.html();
            var mod = this.envModels.findWhere({'name':name});
            this.triggerPopover(mod);
            
        },

        highlightModel: function(mod) {
            //finds an entity representing mod and highlights it
            for (var i = 0; i < this.modelBoundaries.length; i++) {
                if (this.modelBoundaries[i]._js_model === mod){
                    this.modelBoundaries[i].polygon.material = new Cesium.ColorMaterialProperty(
                        Cesium.Color.LIGHTGRAY.withAlpha(0.8)
                    );
                } else {
                    this.modelBoundaries[i].polygon.material = new Cesium.ColorMaterialProperty(
                        Cesium.Color.LIGHTGRAY.withAlpha(0.2)
                    );
                }
            }
        },

        unhighlightModel: function(mod) {
            //finds an entity representing mod and unhighlights it
            for (var i = 0; i < this.modelBoundaries.length; i++) {
                if (this.modelBoundaries[i]._js_model === mod){
                    this.modelBoundaries[i].polygon.material = new Cesium.ColorMaterialProperty(
                        Cesium.Color.LIGHTGRAY.withAlpha(0.2)
                    );
                }
            }
        },

        unhighlightAllModels: function(mod) {
            for (var i = 0; i < this.modelBoundaries.length; i++) {
                this.modelBoundaries[i].polygon.material = new Cesium.ColorMaterialProperty(
                    Cesium.Color.LIGHTGRAY.withAlpha(0.2)
                );
            }
        },

        subsetModel: function(e) {
            //choosing the source here to defaul to first one in list which is primary forecast
            //TODO: add some logic when we want to expose archive sources
            var model_source = this.selectedModel.get('sources')[0].name;
            this.selectedModel.set('source',model_source);
            $.get(webgnome.config.api+'/goods/list_models',
                    {model_id: this.selectedModel.get('identifier'),
                     model_source: model_source,
                    }
                ).done(_.bind(function(request_obj){
                    this.selectedModel.set('actual_start',request_obj.actual_start);
                    this.selectedModel.set('actual_end',request_obj.actual_end);
                    var subsetForm = new SubsetForm({size: 'xl', request_type: this.request_type}, this.selectedModel);
                        subsetForm.on('success', _.bind(function(){this.close();}, this));
                    subsetForm.render();
                }, this));
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
        },

        attachMetadataToPopover: function(js_model){
            var content;
            this.selectedModel = js_model;
            var forecast = js_model.get('sources')[0];

            content = _.template(MetadataTemplate)({
                model: js_model,
                forecast_start: forecast.start,
                forecast_end: forecast.end
            });
            this.$('#goods-description').html(content);
            this.$('.spinner').hide();
        },

        triggerPopover: function(pickedObject) {
            if (pickedObject) {
                if (!_.isUndefined(pickedObject.id) && pickedObject.id instanceof Cesium.Entity) {
                    pickedObject = pickedObject.id.js_model;
                }
                this.highlightModel(pickedObject);
                this.map.resetCamera(pickedObject);
                this.$('.popover').show();
                this.$('.spinner').show();
                this.attachMetadataToPopover(pickedObject);
            } else {
                this.unhighlightAllModels();
                this.$('.popover').hide();
            }
        },
    });

    return goodsMoverForm;
});