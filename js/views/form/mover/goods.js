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
        title: 'Select Currents',
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
            this.goods = new ShorelineResource();
        },

        render: function(){
            this.body = _.template(GoodsTemplate)();
            FormModal.prototype.render.call(this);
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
            this.envModels.getBoundedList(model_map).then(
                _.bind(function(mod){
                    for (var i = 0; i < mod.length; i++){
                        var listEntry = $('<div class="item"></div');
                        listEntry.html(mod.models[i].get('identifier'));
                        if (!mod.models[i].get('regional')){
                            this.$('#regionalModelsHeader').after(listEntry);
                            mod.models[i].produceBoundsPolygon(this.map.viewer);
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
            var identifier = tgt.html();
            var mod = this.envModels.findWhere({'identifier':identifier});
            this.triggerPopover(mod);
            
        },

        subsetModel: function(e) {
            var subsetForm = new SubsetForm({size: 'xl'}, this.selectedModel);
            subsetForm.on('save', _.bind(function(){this.close()}, this));
            subsetForm.render();
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
            if(!_.isUndefined(js_model.get('forecast_metadata'))){
                    content = _.template(MetadataTemplate)({
                    model: js_model,
                    cast: js_model.get('forecast_metadata')
                });
                this.$('#forecast-tab').html(content);
                this.$('.spinner').hide();
            }
            if(!_.isUndefined(js_model.get('hindcast_metadata'))){
                    content = _.template(MetadataTemplate)({
                    model: js_model,
                    cast: js_model.get('hindcast_metadata')
                });
                this.$('#hindcast-tab').html(content);
                this.$('.spinner').hide();
            }
            if(!_.isUndefined(js_model.get('nowcast_metadata'))){
                    content = _.template(MetadataTemplate)({
                    model: js_model,
                    cast: js_model.get('nowcast_metadata')
                });
                this.$('#nowcast-tab').html(content);
                this.$('.spinner').hide();
            }
        },

        triggerPopover: function(pickedObject) {
            if (pickedObject) {
                if (!_.isUndefined(pickedObject.id) && pickedObject.id instanceof Cesium.Entity) {
                    pickedObject = pickedObject.id.js_model;
                }
                this.map.resetCamera(pickedObject);
                this.$('.popover').show();
                this.$('.spinner').show();
                this.attachMetadataToPopover(pickedObject);
            } else {
                this.$('.popover').hide();
            }
        },

        validate: function(bounds) {
            var dx = bounds.width * 180/3.1415;
            var dy = bounds.height * 180/3.1415;
            if (dx * dy > 100) {
                return false;
            } else { 
                return true;  
            }            
        },

        save: function() {
            var model_name =  this.$('.currents').val();
            var points = this.map.toolbox.currentTool.activePoints;
            var bounds = Cesium.Rectangle.fromCartesianArray(points);
            if (this.validate(bounds)) {
                var northLat = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.north));
                var southLat = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.south));
                var westLon = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.west));
                var eastLon = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.east));
                var xDateline = 0;
                if (westLon > eastLon || westLon < -180){
                    //probably crossing dateline
                    xDateline = 1;
                }
                $.post(webgnome.config.api+'/goods/currents',
                    {session: localStorage.getItem('session'),
                     model_name: model_name,
                     NorthLat: northLat,
                     WestLon: westLon,
                     EastLon: eastLon,
                     SouthLat: southLat,
                     xDateline: xDateline,
                     submit: 'Get Currents',
                    }
                ).done(_.bind(function(fileList){
                        $.post(webgnome.config.api + '/mover/upload',
                            {'file_list': JSON.stringify(fileList),
                             'obj_type': PyCurrentMover.prototype.defaults.obj_type,
                             'name': model_name,
                             'session': localStorage.getItem('session'),
                             'tshift': 0,
                            }
                        ).done(_.bind(function(response) {
                            var mover = new PyCurrentMover(JSON.parse(response), {parse: true});
                            webgnome.model.get('movers').add(mover);
                            webgnome.model.get('environment').add(mover.get('current'));
                            webgnome.model.save();
                            this.hide();
                        }, this)
                        ).fail( 
                            _.bind(function(resp, a, b, c){
                                //error func for mover creation
                                console.log(resp, a, b, c);
                                this.error('Error!', 'Error creating mover.');
                            },this)
                        ).always(
                            _.bind(function(){
                                this.$('.save').prop('disabled', false);
                                this.$('cancel').prop('disabled', false);
                            },this)
                        );
                     }, this)
                ).fail(_.bind(function(resp, a, b, c){
                         //error func for /goods/ POST
                         console.log(resp, a, b, c);
                        if (resp.statusText === "Request Timeout") {
                            this.error('Error!', 'Request took too long. Try requesting a smaller geographic area.');
                        } else {
                            this.error('Error!', 'An unknown error occurred.');
                        }                    
                        this.$('.save').prop('disabled', false);
                        this.$('cancel').prop('disabled', false);
                     }, this)
                );
                this.$('.save').prop('disabled', true);
                this.$('cancel').prop('disabled', true);
            } else {
                this.error('Error!', "Selected region too large.");
                this.$('.save').prop('disabled', false);
                this.$('cancel').prop('disabled', false);
            }
        }
    });

    return goodsMoverForm;
});