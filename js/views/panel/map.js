define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'views/panel/base',
    'views/default/cesium',
    'model/map/map',
    'views/form/map/type',
    'views/form/map/param',
    'views/form/map/map',
    'text!templates/panel/map.html',
    'views/modal/form'
], function($, _, Backbone, Cesium, BasePanel, CesiumView, MapModel, MapTypeForm, ParamMapForm, MapForm, MapPanelTemplate, FormModal){
    var mapPanel = BasePanel.extend({
        className: 'col-md-3 map object panel-view',

        events:{
            'click .perm-add': 'new',
            'click .add': 'edit',
            'click #mini-locmap': 'openMapModal',
            'webkitfullscreenchange #mini-locmap': 'resetCamera',
            'mozfullscreenchange #mini-locmap' : 'resetCamera',
            'msfullscreenchange #mini-locmap' : 'resetCamera',
            'fullscreenchange #mini-locmap' : 'resetCamera'
        },

        models: [
            'gnome.model.Model',
            'gnome.maps.map.GnomeMap',
            'gnome.maps.map.ParamMap',
            'gnome.maps.map.MapFromBNA'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            _.extend({}, BasePanel.prototype.events, this.events);
            this.listenTo(webgnome.model, 'change:map', this.rerender);
            this.listenTo(webgnome.model, 'change:map', this.setupMapListener);
            //document.addEventListener("mozfullscreenchange", _.bind(this.resetCamera, this));
            this.setupMapListener();
            this.mozResetCamera = _.bind(function(e){
                this.resetCamera(e);
                document.removeEventListener("mozfullscreenchange", this.mozResetCamera);
            }, this);
        },

        setupMapListener: function(){
            this.listenTo(webgnome.model.get('map'), 'sync', this.rerender);
        },

        rerender: function() {
            this.render();
        },

        openMapModal: function(e) {
            if(!_.isUndefined(this.minimap)){
                var element = this.minimap.el;
                if(element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
                document.addEventListener("mozfullscreenchange", this.mozResetCamera);
            }
        },

        resetCamera: function(e) {
            this.minimap.resetCamera(webgnome.model.get('map'));
        },

        render: function(){
            var map = webgnome.model.get('map');

            if(map && map.get('obj_type') !== 'gnome.maps.map.GnomeMap'){
                this.$el.html(_.template(MapPanelTemplate, {
                    map: true
                }));

                this.$('.panel').addClass('complete');
                this.$('.panel-body').removeClass('text');
                this.$('.panel-body').addClass('map').show({
                    duration: 10,
                    done: _.bind(function(){
                        if (!this.minimap){
                            var new_view = true;
                            if (CesiumView.viewCache[map.get('id')]) {
                                new_view = false;
                            }
                            this.minimap = CesiumView.getView(map.get('id'));
                            this.minimap.render();
                            if (new_view) {
                                map.getGeoJSON().then(_.bind(function(data){
                                    map.processMap(data, null, this.minimap.viewer.scene.primitives);
                                }, this));
                            } else {
                                for (var i = 0; i < this.minimap.viewer.scene.primitives.length; i++) {
                                    this.minimap.viewer.scene.primitives._primitives[i].show = true;
                                }
                            }
                        } else {
                            this.minimap.viewer.scene.primitives.removeAll();
                            map.getGeoJSON().then(_.bind(function(data){
                                map.processMap(data, null, this.minimap.viewer.scene.primitives);
                            }, this));
                        }
                        this.$('#mini-locmap').append(this.minimap.$el);
                        this.minimap.resetCamera(map);
                        this.trigger('render');
                    }, this)
                });
            } else {
                this.$el.html(_.template(MapPanelTemplate, {
                    map: false
                }));
                this.$('.panel').addClass('complete');
                this.$('.panel-body').addClass('text').show();
                this.$('.panel-body').removeClass('map');
            }
            BasePanel.prototype.render.call(this);
        },

        new: function(){
            var mapForm = new MapTypeForm();
            mapForm.on('hidden', mapForm.close);
            mapForm.on('waterWorld', _.bind(function(){
                    webgnome.model.set('map', new MapModel());
                    webgnome.model.save(null, {validate: false});
                }, this));
            mapForm.on('select', _.bind(function(form){
                mapForm.on('hidden', _.bind(function(){
                    form.on('hidden', form.close);
                    form.render();
                }, this));
            }, this));
            mapForm.render();
        },

        edit: function(){
            var map = webgnome.model.get('map');
            var form;
            if(map.get('obj_type') === 'gnome.maps.map.ParamMap'){
                form = new ParamMapForm({map: map});
            } else {
                form = new MapForm({map: map});
            }

            form.render();
            form.on('hidden', form.close);
            form.on('save', map.resetRequest, map);
        },

        close: function(){
            if (this.minimap) {
                this.minimap.close();
            }
            BasePanel.prototype.close.call(this);
        }
    });

    return mapPanel;
});