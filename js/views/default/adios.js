define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/adios.html'
], function($, _, Backbone, AdiosTemplate){
    'use strict';
    var adiosView = Backbone.View.extend({
        className: 'container page adios',

        events: {
            'click .resume': 'resume',
            'click .build': 'build',
            'click .load': 'load',
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(AdiosTemplate, {
                hasModel: webgnome.hasModel()
            });
            $('body').append(this.$el.append(compiled));
        },

        resume: function(e){
            e.preventDefault();
            webgnome.router.navigate('adios/model', true);
        },

        build: function(e){
            e.preventDefault();
            webgnome.router.navigate('adios/setup', true);
        },

        load: function(e){
            e.preventDefault();
        }
    });

    return adiosView;
});