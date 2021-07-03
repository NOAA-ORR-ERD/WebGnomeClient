define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/gnome.html',
    'views/wizard/new',
    'views/form/oil/library'
], function($, _, Backbone, GnomeTemplate, NewWizardForm, OilLibForm){
    'use strict';
    var gnomeView = Backbone.View.extend({
        className: 'container page gnome',

        initialize: function() {
            this.render();
        },

        events: {
            'click .location': 'chooseLocation',
            'click .build': 'buildModel',
            'click .load': 'loadModel',
            'click .resume': 'resumeModel'
        },

        chooseLocation: function(event) {
            event.preventDefault();
            webgnome.router.navigate('gnome/locations', true);
        },

        buildModel: function(event) {
            event.preventDefault();

            new NewWizardForm();
        },

        loadModel: function(event) {
            event.preventDefault();
        },

        resumeModel: function(event) {
            event.preventDefault();
            webgnome.router.navigate('gnome/model', true);
        },

        render: function(){
            var tmpl = _.template(GnomeTemplate);
            var compiled = tmpl({
                hasModel: webgnome.hasModel()
            });
            $('body').append(this.$el.append(compiled));
        }
    });
    return gnomeView;
});