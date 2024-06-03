define([
    'underscore',
    'jquery',
    'cesium',
    'module',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'text!templates/form/mover/goods.html',
    'text!templates/form/mover/goods_cast_metadata.html',
    'views/form/mover/subset',
    'model/map/base',
    'collection/envConditionsCollection'
], function(_, $, Cesium, module, FormModal,
    CesiumView, RectangleTool, GoodsTemplate, MetadataTemplate, SubsetForm,
    BaseMap, EnvConditionsCollection){
    
    var goodsMoverForm = FormModal.extend({
        title: 'Select Model',
        className: 'modal form-modal goods-map',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</div>',
        events: function() {
            return _.defaults({
                'click .item': 'pickModelFromList',
                'click .popover-subset-button': 'subsetModel',
                'click .cancel': 'close',
                'click .goods-ignore-map-bounds': 'rerender',
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            //this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            if (webgnome.isUorN(options.request_type) || options.request_type === 'currents'){
                this.request_type = 'currents';
                this.title = 'Select Ocean Model';
            } else {
                this.request_type = options.request_type;
                this.title = 'Select Wind Model';
            }
            this.modelBoundaries = [];
        },

        render: function(ignore_map_bounds_checked){
            this.body = _.template(GoodsTemplate)();
            FormModal.prototype.render.call(this);
            this.$('#goods-ignore-map-bounds-checkbox').prop('disabled', true);
            this.$('#goods-ignore-map-bounds-checkbox')[0].checked = ignore_map_bounds_checked;
            this.$('.save').hide();
            this.$('.popover').hide();
            
            this.map = CesiumView.getView(
                'goods-map',
                {baseLayerPicker: true,}, //cesium options
                {cache_save: false, cache_load: false}); //cache options
            this.$('#shoreline-goods-map').append(this.map.$el);
            this.map.render();

            //add and focus map, if available
            var ignore_map_bounds = this.$('#goods-ignore-map-bounds-checkbox')[0].checked;
            var model_map = webgnome.model.get('map');
            if(model_map.get('obj_type') !== 'gnome.maps.map.GnomeMap'){
                model_map.getGeoJSON().then(_.bind(function(data){
                    model_map.processMap(data, null, this.map.viewer.scene.primitives);
                    model_map.genBnd(this.map.viewer);
                    if (!ignore_map_bounds) {
                        this.map.resetCamera(model_map);
                    }
                }, this));
            }

            //add release visualizations
            var spills = webgnome.model.get('spills').models;
            for (var i = 0; i < spills.length; i++){
                this.map.viewer.dataSources.add(spills[i].get('release').generateVis());
            }

            this.envModels = new EnvConditionsCollection();
            this.modelBoundaries = [];
            var req_typ, request_bounds;
            if (this.request_type === 'currents') {
                req_typ = ['surface currents'];
            } else {
                req_typ = ['surface winds'];
            }

            if (ignore_map_bounds) {
                request_bounds = BaseMap.prototype.defaults().map_bounds;
            } else {
                request_bounds = model_map.get('map_bounds');
            }

            this.envModels.getBoundedList(request_bounds, req_typ).then(
                _.bind(function(mod){
                    var num_regional_models = 0;
                    var listEntry;
                    for (var i = 0; i < mod.length; i++){
                        listEntry = $('<div class="item"></div');
                        listEntry.html(mod.models[i].get('name'));
                        if (!mod.models[i].get('regional')){
                            this.$('#regionalModelsHeader').after(listEntry);
                            this.modelBoundaries.push(mod.models[i].produceBoundsPolygon(this.map.viewer));
                            num_regional_models += 1;
                        } else {
                            this.$('#globalModelsHeader').after(listEntry);
                        }
                    }
                    if (num_regional_models === 0) {
                        listEntry = $('<div class="item"></div');
                        listEntry.html('No compatible models found');
                        this.$('#regionalModelsHeader').after(listEntry);                
                    }
                    
                    this.addCesiumHandlers();
                    this.$('#goods-ignore-map-bounds-checkbox').prop('disabled', false);
                }, this)
            );
        },

        rerender: function() {
            //Rerenders the content of this form. Cleans up the cesium map and requests and re-adds
            //new models from the server

            //shut off controls that could interfere
            this.$('#goods-ignore-map-bounds-checkbox').prop('disabled', true);
            var checked = this.$('#goods-ignore-map-bounds-checkbox')[0].checked;

            //cleanup all polygons
            for (var i = 0; i < this.modelBoundaries.length; i++) {
                this.map.viewer.entities.remove(this.modelBoundaries[i]);
            }
            //cleanup events
            this.map.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.envModels = [];
            this.modelBoundaries = [];
            this.$el.html('');
            this.render(checked);

        },

        pickModelFromList: function(e) {
            var tgt = $(e.currentTarget);
            var name = tgt.html();
            tgt.addClass('active');
            var mod = this.envModels.findWhere({'name':name});
            if (!this.controlsLocked){
                this.triggerPopover(mod);
            }
            
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
            this.$('.item').removeClass('active');
        },

        subsetModel: function(e) {
            //choosing the source here to default to first one in list which is primary forecast
            //TODO: add some logic when we want to expose archive sources
            var model_source = this.selectedModel.get('sources')[0].name;
            var ignore_map_bounds = this.$('#goods-ignore-map-bounds-checkbox')[0].checked;
            this.selectedModel.set('source',model_source);
            this.lockControls();
            $.get(webgnome.config.api+'/goods/list_models',
                    {model_id: this.selectedModel.get('identifier'),
                     model_source: model_source,
                    }
                ).done(_.bind(function(request_obj){
                    this.unlockControls();
                    this.selectedModel.set('actual_start',request_obj.actual_start);
                    this.selectedModel.set('actual_end',request_obj.actual_end);
                    var subsetForm = new SubsetForm({
                        size: 'xl',
                        request_type: this.request_type,
                        wizard: this.options.wizard,
                        ignore_map_bounds: ignore_map_bounds,
                    }, this.selectedModel);
                    this.trigger('select', subsetForm);
                    this.hide(function(){subsetForm.render();});
                }, this)
                ).fail(
                    _.bind(function(resp){
                        this.error(resp);
                        this.unlockControls();
                    }, this)
                );
        },

        lockControls: function() {
            FormModal.prototype.lockControls.call(this);
            this.$('.popover-subset-button').prop('disabled', true);
            this.controlsLocked = true;
        },

        unlockControls: function() {
            FormModal.prototype.unlockControls.call(this);
            this.$('.popover-subset-button').prop('disabled', false);
            this.controlsLocked = false;
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
            var listItems = this.$('.item');
            for (var i = 0; i < listItems.length; i++) {
                var itm = listItems[i];
                if (itm.innerHTML.indexOf(js_model.get('name')) !== -1) {
                    $(itm).addClass('active');
                }
                
            }

            content = _.template(MetadataTemplate)({
                model: js_model,
                forecast_start: forecast.start,
                forecast_end: forecast.end
            });
            this.$('#goods-description').html(content);
            this.$('.spinner').hide();
        },

        triggerPopover: function(pickedObject) {
            if (pickedObject && 
                !_.isUndefined(pickedObject.id) &&
                pickedObject.id instanceof Cesium.Entity && 
                pickedObject.id.js_model) {
                    
                pickedObject = pickedObject.id.js_model;
                this.unhighlightAllModels();
                this.highlightModel(pickedObject);
                this.map.resetCamera(pickedObject);
                this.$('.popover').show();
                this.$('.spinner').show();
                this.attachMetadataToPopover(pickedObject);
            } else {
                if (!this.controlsLocked){
                    this.unhighlightAllModels();
                    this.$('.popover').hide();
                }
            }
        },

        close: function() {
            FormModal.prototype.close.call(this);
        },
    });

    return goodsMoverForm;
});