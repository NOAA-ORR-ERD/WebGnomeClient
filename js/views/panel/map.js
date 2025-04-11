define([
    'jquery',
    'underscore',
    'backbone',
    'views/panel/base',
    'views/cesium/cesium',
    'model/map/map',
    'views/form/map/type',
    'views/form/map/param',
    'views/form/map/map',
    'text!templates/panel/map.html',
    'views/modal/form'
], function($, _, Backbone, BasePanel, CesiumView, MapModel, MapTypeForm, ParamMapForm, MapForm, MapPanelTemplate, FormModal){
    var mapPanel = BasePanel.extend({
        className: 'col-md-3 map object panel-view',

        events:{
            'click .perm-add': 'new',
            'click .add': 'edit',
            'click #mini-locmap': 'openMapModal',
            'webkitfullscreenchange #mini-locmap': 'fullscreenhandler',
            'mozfullscreenchange #mini-locmap' : 'fullscreenhandler',
            'msfullscreenchange #mini-locmap' : 'fullscreenhandler',
            'fullscreenchange #mini-locmap' : 'fullscreenhandler'
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
            this.map_added = false;
            this.map_cid = undefined;
            this.primitives = undefined;
        },

        setupMapListener: function(){
            this.listenTo(webgnome.model.get('map'), 'sync', this.rerender);
        },

        rerender: function(caller, changed, options) {
            if (this.map_cid !== changed.cid){
                this.map_added = false;
                this.map_cid = changed.cid;
                this.minimap.requesting = false;
                this.primitives = undefined;
                if(this.minimap){
                    this.minimap.viewer.scene.primitives.removeAll();
                }
            }
            this.dbRender();
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

        fullscreenhandler: function() {
            var fullElem = document.fullscreenElement;
            if (_.isNull(fullElem)) {
                //Going from fullscreen to mini
                this.minimap.overlay.hide();
                this.minimap.graticule.deactivate();
            } else {
                //Going from mini to full
                this.minimap.overlay.show();
                this.minimap.graticule.activate();
            }
            this.resetCamera();
        },

        render: function(){
            var map = webgnome.model.get('map');
            this.map_cid = map.cid;

            if(map && map.get('obj_type') !== 'gnome.maps.map.GnomeMap'){
                this.$el.html(_.template(MapPanelTemplate)({
                    map: true
                }));

                this.$('.panel').addClass('complete');
                this.$('.panel-body').show();
                if (!this.minimap){
                    var new_view = true;
                    if (CesiumView.viewCache[map.get('id')]) {
                        new_view = false;
                    }
                    this.minimap = CesiumView.getView(map.get('id'));
                    this.minimap.render();
                    if (new_view) {
                        map.getGeoJSON().then(_.bind(function(data){
                            this.primitives = map.processMap(data, null, this.minimap.viewer.scene.primitives);
                            this.minimap.requesting = false;
                            this.map_added = true;
                        }, this));
                        this.minimap.requesting = true;
                        //large maps may not appear in minimap until rerender. This timing issue is not simple to solve.
                    } else {
                        for (var i = 0; i < this.minimap.viewer.scene.primitives.length; i++) {
                            this.minimap.viewer.scene.primitives._primitives[i].show = true;
                        }
                    }
                } else {
                    if (!this.minimap.requesting && !this.map_added) {
                        map.getGeoJSON().then(_.bind(function(data){
                            map.processMap(data, null, this.minimap.viewer.scene.primitives);
                            this.map_added = true;
                        }, this));
                    }
                }
                this.$('#mini-locmap').append(this.minimap.$el);
                this.minimap.resetCamera(map);
                this.trigger('render');
            } else {
                this.$el.html(_.template(MapPanelTemplate)({
                    map: false
                }));
                this.$('.panel').addClass('complete');
                this.$('.panel-body').show();
            }
            BasePanel.prototype.render.call(this);
        },

        dbRender: _.debounce(function() {
            this.render();
        }, 40),

        new: function(){
            var mapForm = new MapTypeForm();
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