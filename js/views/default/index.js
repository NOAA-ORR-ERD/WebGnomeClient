define([
    'jquery',
    'underscore',
    'backbone',
    'ol',
    'views/default/load',
    'text!templates/default/index.html',
    'views/wizard/adios',
    'views/wizard/gnome',
    'views/default/map',
    'model/gnome'
], function($, _, Backbone, ol, LoadView, IndexTemplate, AdiosWizard, GnomeWizard, MapView, GnomeModel){
    'use strict';
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .advanced': 'setup',
            'click .location': 'location',
            'click .adios-wizard': 'adios',
            'click .gnome-wizard': 'gnome',
            'click .doc': 'doc',
            'click .roc': 'roc'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            $('body').append(this.$el.append(compiled));
            this.load = new LoadView({simple: true, el: this.$('.load')});
        },

        setup: function(e){
            e.preventDefault();
            if(webgnome.hasModel()){
                webgnome.model.set('mode', 'gnome');
                webgnome.model.save({'name': 'Model'});
            }
            webgnome.router.navigate('config', true);
        },

        location: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
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
