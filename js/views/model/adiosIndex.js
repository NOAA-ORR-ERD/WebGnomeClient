define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var adiosModelView = Backbone.View.extend({
        className: 'page adios model',

        initialize: function(){
            this.render();
        },

        events: {
            'click .resize': 'toggle',
        },

        toggle: function(){

        },

        render: function(){

        },

        close: function(){
            this.remove();
            this.unbind();
        }
    });

    return adiosModelView;
});