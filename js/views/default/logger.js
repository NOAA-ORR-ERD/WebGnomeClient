define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/logger/index.html'
], function($, _, Backbone, LoggerTemplate){
    var loggerView = Backbone.View.extend({
        className: 'logger',

        events: {
            'click .toggle': 'toggle'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(LoggerTemplate);
            this.$el.append(LoggerTemplate);
            $('body').append(this.$el);
        },

        toggle: function(){
            $('body').toggleClass('logger-open');
            this.$el.toggleClass('open');
        }
    });

    return loggerView;
});