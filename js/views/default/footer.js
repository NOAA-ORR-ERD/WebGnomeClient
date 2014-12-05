define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var footerView = Backbone.View.extend({
        className: 'footer',

        initialize: function(){
            this.render();
        },

        render: function(){
            this.$el.append('footer here');
            $('body').append(this.$el);
        }
    });

    return footerView;
});