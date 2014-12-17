define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var loadingView = Backbone.View.extend({
        className: 'app-state loading',
        initialize: function(){
            this.render();
        },

        render: function(){
            if($('.app-state.loading').length === 0){
                this.$el.append('Loading...');
                $('body').append(this.$el);
            }
        }
    });

    return loadingView;
});