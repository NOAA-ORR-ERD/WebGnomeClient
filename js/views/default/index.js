define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/default/index.html'
], function($, _, Backbone, IndexTemplate, LocationsModal){
    var indexView = Backbone.View.extend({
        initialize: function() {
            $('body').append('<div class="container page"></div>');
            this.el = $('.page');
            this.$el = $('.page');
            this.render();
        },

        events: {
            'click .location': 'chooseLocation',
            'click .build': 'buildModel',
            'click .load': 'loadModel'
        },

        chooseLocation: function(event) {
            event.preventDefault();
            webgnome.router.navigate('locations', true);
        },

        buildModel: function(event) {
            event.preventDefault();
            webgnome.router.navigate('route:model', true);
        },

        loadModel: function(event) {
            event.preventDefault();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            this.$el.html(compiled);
        }
    });
    return indexView;
});