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

            if(localStorage.getItem('logger') != 'null'){
                this.toggle();
            }
        },

        toggle: function(e){
            $('body').toggleClass('logger-open');
            this.$el.toggleClass('open');

            if(e){
                if(localStorage.getItem('logger') != 'null'){
                    localStorage.setItem('logger', null);
                } else {
                    localStorage.setItem('logger', true);
                }
            }
        },

        startSocket: function(){
            this.log('Connecting...');
            this.socket = new WebSocket(this.socketUrl);
            this.socket.onerror = _.bind(this.socketError, this);
            this.socket.onconnect = _.bind(this.socketConnect, this);
        },

        socketError: function(error){
            this.log({type: 'error', message: 'Failed to connect!'});
        },

        socketConnect: function(){
            this.log('Connected!');
        },

        /**
         * Print a log message to the window
         * @param  {Object or String}
         */
        log: function(message){
            if(_.isString(message)){
                this.$('.window .logs').append('<li>' + message + '</li>');
                return;
            }

            if(_.isObject(message)){
                this.$('.window .logs').append('<li class="' + message.type + '">' + message.message + '</li>');
                return;
            }
        }
    });

    return loggerView;
});