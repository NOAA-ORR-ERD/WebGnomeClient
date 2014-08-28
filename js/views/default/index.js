define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/index.html'
], function($, _, Backbone, IndexTemplate){
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .gnome': 'gnome',
            'click .adios': 'adios'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            $('body').append(this.$el.append(compiled));
        },

        gnome: function(){
            webgnome.router.navigate('gnome/', true);
        },

        adios: function(){
            webgnome.router.navigate('adios/', true);
        }
    });

    return indexView;
});