define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/load',
    'text!templates/default/index.html',
    'views/wizard/adios',
    'views/wizard/gnome'
], function($, _, Backbone, LoadView, IndexTemplate, AdiosWizard, GnomeWizard){
    'use strict';
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .setup': 'setup',
            'click .advanced': 'setup',
            'click .location': 'location',
            'click .adios-wizard': 'adios',
            'click .gnome-wizard': 'gnome'
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
            webgnome.router.navigate('config', true);
        },

        location: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
        },

        adios: function(e){
            e.preventDefault();
            var wiz = new AdiosWizard();
        },

        gnome: function(e){
            e.preventDefault();
            var wiz = new GnomeWizard();
        },

        close: function(){
            this.load.close();
            Backbone.View.prototype.close.call(this);
        }
    });

    return indexView;
});