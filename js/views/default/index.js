define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/index.html'
], function($, _, Backbone, IndexTemplate){
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .setup': 'setup'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            $('body').append(this.$el.append(compiled));
        },

        setup: function(e){
            e.preventDefault();
            webgnome.router.navigate('setup', true);
        }
    });

    return indexView;
});