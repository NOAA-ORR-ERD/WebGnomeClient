define([
    'underscore',
    'jquery',
    'cesium',
    'module',
    'model/map/bna',
    'views/modal/form',
    'views/cesium/cesium',
    'views/cesium/tools/rectangle_tool',
    'text!templates/form/map/goods.html',
    'model/resources/shorelines'
], function(_, $, Cesium, module, MapBNAModel, FormModal, CesiumView, RectangleTool, GoodsTemplate, ShorelineResource){
    var goodsMapForm = FormModal.extend({
        title: 'Custom Map Generator',
        className: 'modal form-modal goods-map',

        events: function(){
            return _.defaults({
                'click .download': 'download',
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            this.model = new ShorelineResource();
            this._downloadedMap = this._prevRequest = undefined;
        },

        render: function(){
            this.body = _.template(GoodsTemplate)();
            FormModal.prototype.render.call(this);
            this.map = new CesiumView({
                baseLayerPicker: true,
                toolboxOptions:{defaultToolType: RectangleTool}
            });
            this.$('#shoreline-goods-map').append(this.map.$el);
            this.map.render();

            //add release visualizations
            var spills = webgnome.model.get('spills').models;
            for (var i = 0; i < spills.length; i++){
                this.map.viewer.dataSources.add(spills[i].get('release').generateVis());
            }
        },
        
        update: function(){
            var shoreline_source = this.$('#coastline_source').val();
            if (shoreline_source !== 'gshhs') {
                    this.$('#gshhs_resolution').addClass('hide');
                } else {
                    this.$('#gshhs_resolution').removeClass('hide');    
                }
        },

        download: function() {
            //Triggers a download of the selected region. If save button is subsequently pressed the
            //map file on the API is re-used.
            this.lockControls();
            var points = this.map.toolbox.currentTool.activePoints;
            var bounds = Cesium.Rectangle.fromCartesianArray(points);
            var northLat = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.north));
            var southLat = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.south));
            var westLon = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.west));
            var eastLon = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.east));
            var xDateline = 0;
            if (westLon > eastLon || westLon < -180){
                //probably crossing dateline
                xDateline = 1;
            }
            this._prevRequest = {NorthLat: northLat,
                WestLon: westLon,
                EastLon: eastLon,
                SouthLat: southLat,
                xDateline: xDateline,
                shoreline: this.$('#coastline_source').val(),
                resolution: this.$('#resolution').val(),
                submit: 'Get Map',
               };
            $.post(webgnome.config.api+'/goods/maps',
                this._prevRequest
            ).done(_.bind(function(fileList){
                    this._downloadedMap = fileList;
                    window.location.href = webgnome.config.api + '/user_files?file_list=' + JSON.stringify(fileList);
                },this)
            ).fail(_.bind(function(resp, a, b, c){
                //error func for /goods/ POST
                console.error(a);
                this.unlockControls();
                }, this)
            ).always(
                _.bind(function(){
                    this.unlockControls();
                },this)
            );
        },

        mapObjRequestFunc: function(fileList){
            $.post(webgnome.config.api + '/map/upload',
                {'file_list': JSON.stringify(fileList),
                 'obj_type': MapBNAModel.prototype.defaults().obj_type,
                 'name': 'custom_map',
                 'session': localStorage.getItem('session')
                }
            ).done(_.bind(function(response) {
                var map = new MapBNAModel(JSON.parse(response));
                webgnome.model.save('map', map, {'validate':false});
                this.hide();
            }, this)
            ).fail( 
                _.bind(function(resp, a, b, c){
                    //error func for map creation
                    console.log(resp, a, b, c);
                },this)
            ).always(
                _.bind(function(){
                    this.unlockControls();
                },this)
            );
        },

        save: function() {
            this.lockControls();
            var points = this.map.toolbox.currentTool.activePoints;
            var bounds = Cesium.Rectangle.fromCartesianArray(points);
            var northLat = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.north));
            var southLat = Cesium.Math.toDegrees(Cesium.Math.clampToLatitudeRange(bounds.south));
            var westLon = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.west));
            var eastLon = Cesium.Math.toDegrees(Cesium.Math.convertLongitudeRange(bounds.east));
            var xDateline = 0;
            if (westLon > eastLon || westLon < -180){
                //probably crossing dateline
                xDateline = 1;
            }
            var newRequest = {NorthLat: northLat,
             WestLon: westLon,
             EastLon: eastLon,
             SouthLat: southLat,
             xDateline: xDateline,
             shoreline: this.$('#coastline_source').val(),
             resolution: this.$('#resolution').val(),
             submit: 'Get Map',
            };
            if (_.isEqual(newRequest, this._prevRequest) && this._downloadedMap){
                //no change in request, and previous download, so use existing file
                this.mapObjRequestFunc(this._downloadedMap);
            } else {
                $.post(webgnome.config.api+'/goods/maps',
                newRequest
                ).done(
                    _.bind(this.mapObjRequestFunc, this)
                ).fail(_.bind(function(resp, a, b, c){
                         //error func for /goods/ POST
                        console.error(a);
                        this.unlockControls();
                     }, this)
                );
            }
            
        }
    });

    return goodsMapForm;
});