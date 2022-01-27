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
    'model/resources/shorelines'
], function(_, $, Cesium, module, PyCurrentMover, FormModal, CesiumView, RectangleTool, GoodsTemplate, ShorelineResource){
    
    var goodsMoverForm = FormModal.extend({
        title: 'HYCOM currents',
        className: 'modal form-modal goods-map',

        initialize: function(options){
            this.module = module;
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
            this.goods = new ShorelineResource();
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