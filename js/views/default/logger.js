define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/logger/index.html'
], function($, _, Backbone, LoggerTemplate){
    var loggerView = Backbone.View.extend({
        className: 'logger',
        socketRoute: '/logger',
        socket: null,

        events: {
            'click .toggle': 'toggle'
        },

        initialize: function(){
            this.render();

            var url = webgnome.config.api.split(':');
            url.shift();
            this.socketUrl = 'ws:' + url.join(':') + this.socketRoute;

            this.startSocket();
        },

        render: function(){
            var compiled = _.template(LoggerTemplate);
            this.$el.append(LoggerTemplate);
            $('body').append(this.$el);
        },

        toggle: function(){
            $('body').toggleClass('logger-open');
            this.$el.toggleClass('open');
        },

        startSocket: function(){
            this.socket = new WebSocket(this.socketUrl);
        }
    });

    return loggerView;
});