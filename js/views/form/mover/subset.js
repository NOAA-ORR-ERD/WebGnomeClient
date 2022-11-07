define([
    'underscore',
    'jquery',
    'cesium',
    'module',
    'moment',
    'model/movers/py_current',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'text!templates/form/mover/subset.html',
    'text!templates/form/mover/goods_cast_metadata.html',
    'model/resources/shorelines',
    'model/visualization/envConditionsModel',
    'collection/envConditionsCollection'
], function(_, $, Cesium, module, moment, PyCurrentMover, FormModal,
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
            this.request_type = options.request_type;
            this.envModel = envModel;
            this.setInitialBounds();
            this.title = 'Subset Form - ' + this.envModel.get('name') + ' ' + this.request_type;
        },

        setInitialBounds: function() {
            var map = webgnome.model.get('map');
            if (map.get('obj_type') !== 'gnome.maps.map.GnomeMap'){
                var rect = map.getBoundingRectangle(false);
                this.wb = Cesium.Math.toDegrees(rect.west);
                this.sb = Cesium.Math.toDegrees(rect.south);
                this.eb = Cesium.Math.toDegrees(rect.east);
                this.nb = Cesium.Math.toDegrees(rect.north);
            } else {
                this.wb = this.envModel.get('bounding_box')[0];
                this.sb = this.envModel.get('bounding_box')[1];
                this.eb = this.envModel.get('bounding_box')[2];
                this.nb = this.envModel.get('bounding_box')[3];
            }
        },

        render: function(){
            this.body = _.template(SubsetTemplate)({
                start_time: webgnome.model.get('start_time'),
                end_time: webgnome.model.getEndTime(),
                bounds: [webgnome.largeNumberFormatter(this.wb),
                         webgnome.largeNumberFormatter(this.nb),
                         webgnome.largeNumberFormatter(this.eb),
                         webgnome.largeNumberFormatter(this.sb)
                ],
                sources:this.envModel.get('sources')

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
                }, this));
            }

            //add release visualizations
            var spills = webgnome.model.get('spills').models;
            for (var i = 0; i < spills.length; i++){
                this.map.viewer.dataSources.add(spills[i].get('release').generateVis());
            }
            this.envModel.produceBoundsPolygon(this.map.viewer);
            this.addCesiumHandlers();
            if (model_map.get('obj_type') !== 'gnome.maps.map.GnomeMap' || this.envModel.get('regional')) {
                this.map.resetCamera(model_map);
            } else {
                this.map.resetCamera(this.envModel);
            }

            //draw initial rectangle before listeners
            this.map.toolbox.currentTool.drawRectFromBounds([this.wb, this.sb, this.eb, this.nb]);

            if (this.request_type === 'winds' || !this.envModel.get('env_params').includes('surface winds')) {
                this.$('#current-options').hide();
            }

            this.listenTo(this.map, 'endRectangle', this.updateBounds);
            this.listenTo(this.map, 'resetRectangle', this.updateBounds);
        },

        updateBounds: function(activePoints) {
            if (activePoints.length === 0) {
                this.wb = this.envModel.get('bounding_box')[0];
                this.nb = this.envModel.get('bounding_box')[3];
                this.eb = this.envModel.get('bounding_box')[2];
                this.sb = this.envModel.get('bounding_box')[1];
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
            var model_name =  this.envModel.get('identifier');
            var points = [this.wb, this.sb, this.eb, this.nb];
            var bounds = new Cesium.Rectangle(points);
            if (this.validate(bounds)) {
                var xDateline = 0;
                if (this.wb > this.eb || this.wb < -180){
                    //probably crossing dateline
                    xDateline = 1;
                }
                var st = this.$('#subset_start_time').val();
                var et = this.$('#subset_end_time').val();
                var surf = this.$('#surface')[0].checked;
                var includeWinds = this.$('#included-winds')[0].checked;
                var source = $('input:radio[name=source]:checked').val();
                var req_typ;
                if (surf){
                    req_typ = 'surface ' + this.request_type;
                } else {
                    req_typ = '3D ' + this.request_type;
                }
                $.post(webgnome.config.api+'/goods_requests',
                    {session: localStorage.getItem('session'),
                     command: 'create',
                     model_name: model_name,
                     NorthLat: this.nb,
                     WestLon: this.wb,
                     EastLon: this.eb,
                     SouthLat: this.sb,
                     start_time: st,
                     end_time: et,
                     surface_only: surf,
                     cross_dateline: xDateline,
                     source: source,
                     include_winds: includeWinds,
                     request_type: req_typ
                    }
                ).done(_.bind(function(request_obj){
                    console.log(request_obj);
                    this.trigger('success');
                    webgnome.getGoodsRequests(null, true).then(function(res){webgnome.model.trigger('save');});
                    this.close();
                }, this));
                this.$('.save').prop('disabled', true);
                this.$('cancel').prop('disabled', true);
            } else {
                this.error('Error!', "Selected region too large.");
                this.$('.save').prop('disabled', false);
                this.$('cancel').prop('disabled', false);
            }
        }
    });
    return subsetForm;
});