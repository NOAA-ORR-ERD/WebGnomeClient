define([
    'jquery',
    'underscore',
    'backbone',
    'socketio',
    'text!templates/default/logger/index.html'
], function($, _, Backbone, io, LoggerTemplate){
    var loggerView = Backbone.View.extend({
        className: 'logger',
        socketRoute: '/logger',
        socket: null,
        count: 0,
        log_item_height: 20,
        events: {
            'click .toggle': 'toggle',
            'mousewheel': 'scroll',
            'click .view a:not(.clear)': 'toggleViewable',
            'click .clear': 'clearMessages'
        },

        initialize: function(){
            this.render();
            this.socketUrl = webgnome.config.api + this.socketRoute;
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
                    this.windowScrollCheck(true);
                }
            }
        },

        startSocket: function(){
            this.log('Connecting...');
            this.socket = io.connect(this.socketUrl);
            this.socket.on('connect', _.bind(this.socketConnect, this));
            this.socket.on('error', _.bind(this.socketError, this));
            this.socket.on('you_just_connected', _.bind(this.socketLog, this));
            this.socket.on('log', _.bind(this.socketLog, this));
        },

        socketError: function(error){
            this.log({type: 'error', message: 'Failed to connect!'});
            this.log({type: 'warning', message: 'Interactve logging has been disabled'});
        },

        socketConnect: function(){
            this.log('Connected!');
        },

        socketLog: function(event){
            this.log(event);
        },

        /**
         * Print a log message to the window
         * @param  {Object or String}
         */
        log: function(message){
            if(_.isString(message)){
                this.$('.window .logs').append('<li class="misc">' + message + '</li>');
                this.count++;
            }

            if(_.isObject(message)){
                var source = message.name.replace('[', '').split('.')[0];
                if(source !== 'gnome' && source !== 'webgnome_api'){
                    source = 'misc';
                }
                var ts = message.time + ' ' + message.date;
                this.$('.window .logs').append('<li class="' + message.level.toLowerCase() + ' ' + source + '"><strong class="' + message.level.toLowerCase() +'">' + message.name + '</strong> ' + _.escape(message.message) + ' <div class="pull-right ' + message.level.toLowerCase() + '">' + ts + '</div></li>');
                this.count++;
            }

            this.evalLogs();
            this.windowScrollCheck();
        },

        windowScrollCheck: function(force){
            force = force ? true : false;
            var win = this.$('.window')[0];
            if(this.$el.hasClass('open') || force){
                if((((this.count * this.log_item_height) + 25) - win.scrollTop) - win.clientHeight < 25 || force){
                    win.scrollTop = win.scrollHeight;
                }
            }
            
        },

        evalLogs: function(){
            var errors = this.$('.logs .error, .logs .criti').length;
            var warnings = this.$('.logs .warni').length;

            if(errors > 0){
                this.$el.addClass('error');
                this.$('.info .error .count').text(errors);
            } else {
                this.$el.removeClass('error');
                this.$('.info .error .count').text('');
            }

            if(warnings > 0){
                this.$el.addClass('warning');
                this.$('.info .warning .count').text(warnings);
            } else {
                this.$el.removeClass('warning');
                this.$('.info .warning .count').text('');
            }
        },

        scroll: function(e, d){
            var win = this.$('.window')[0];
            
            if((win.scrollTop === (win.scrollHeight - win.clientHeight) && d < 0) || (win.scrollTop === 0 && d > 0)) {
                e.preventDefault();
            }
        },

        toggleViewable: function(e){
            e.preventDefault();

            var a = this.$(e.target);
            var win = this.$('.window');
            
            a.toggleClass('active');
            win.toggleClass(a.attr('href').replace('#', ''));

            this.windowScrollCheck();
        },

        clearMessages: function(e){
            e.preventDefault();
            
            this.$('.window .logs').html('');
            this.evalLogs();
            this.windowScrollCheck();
        }
    });

    return loggerView;
});