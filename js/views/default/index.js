define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'views/default/load',
    'text!templates/default/index.html',
    'views/wizard/adios',
    'views/wizard/gnome',
    'views/form/oil/library',
    'model/gnome'
], function($, _, Backbone, swal, LoadView, IndexTemplate, AdiosWizard, GnomeWizard, OilLibraryView, GnomeModel){
    'use strict';
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .advanced': 'setup',
            'click .location': 'location',
            'click .adios-wizard': 'adios',
            'click .gnome-wizard': 'gnome',
            'click .doc': 'doc',
            'click .roc': 'roc',
            'click .oillib': 'oillib'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            $('body').append(this.$el.append(compiled));
            this.load = new LoadView({simple: true, page: false, el: this.$('.load')});
        },

        setup: function(e){ 
            e.preventDefault();
            if (webgnome.hasModel()){
                swal({
                    title: 'Previous Model Setup Found',
                    text:'Choose to continue with your previous scenario or start setting up a new model.',
                    type: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Continue Previous',
                    confirmButtonText: 'New Model',
                    reverseButtons: true
                }).then(_.bind(function(isConfirm){
                    if(isConfirm){                                       
                        webgnome.model = new GnomeModel({
                            mode: 'gnome',
                            name: 'Model',
                        });
                        webgnome.router.navigate('config', true);
                    } else {
                        webgnome.model.save(null, {
                            validate: false, 
                        });
                        webgnome.router.navigate('config', true);
                    }
                }, this));        
            } else {
                webgnome.router.navigate('config', true);
            }
            
            
        },
        
        // setup: function(e) {
            // e.preventDefault();

            // if(webgnome.hasModel()){
                // webgnome.model.set('mode', 'gnome');
                // webgnome.model.save({'name': 'Model'});
            // } else {
                // webgnome.router._cleanup();
            // }

            // webgnome.router.navigate('config', true);
        // },

        location: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
        },
        
        oillib: function(e){
            var oillib = new OilLibraryView();
            oillib.on('save wizardclose', _.bind(function(){
                oillib.close();
            }, this));
            oillib.render();
            oillib.$el.addClass('viewer');
        },

        roc: function(e){
            e.preventDefault();
            webgnome.model = new GnomeModel({
                name: 'ROC Model_',
                duration: 432000,
                time_step: 3600,
                mode: 'roc'
            });
            webgnome.model.save(null, {
                validate: false,
                success: function(){
                    webgnome.router.navigate('roc', true);
                }
            });
        },

        adios: function(e){
            e.preventDefault();
            webgnome.model = new GnomeModel({
                name: 'ADIOS Model_',
                duration: 432000,
                time_step: 3600,
                mode: 'adios'
            });
            webgnome.model.save(null, {
                validate: false,
                success: function(){
                    webgnome.router.navigate('adios', true);
                }
            });
            localStorage.setItem('view', 'fate');
        },

        gnome: function(e){
            e.preventDefault();
            var wiz = new GnomeWizard();
        },

        doc: function(event){
            event.preventDefault();
            window.open("doc/");
        },

        close: function(){
            this.load.close();
            Backbone.View.prototype.close.call(this);
        }
    });

    return indexView;
});
