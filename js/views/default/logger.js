define([
    'jquery',
    'underscore',
    'backbone',
    'socketio',
    'toastr',
    'text!templates/default/logger/index.html'
], function($, _, Backbone, io, toastr, LoggerTemplate) {
    'use strict';
    var loggerView = Backbone.View.extend({
        className: 'logger',
        socketRoute: '/logger',
        socket: null,
        count: 0,
        limit: 250,
        log_item_height: 20,

        events: {
            'click .toggle': 'toggle',
            'mousewheel': 'scroll',
            'click .view a:not(.clear)': 'toggleViewable',
            'click .clear': 'clearMessages'
        },

        initialize: function() {
            this.setupToasts();
            this.render();
            this.socketConnect();
        },

        setupToasts: function() {
            toastr.options.preventDuplicates = true;
            toastr.options.closeButton = true;
            toastr.options.newestOnTop = false;
            toastr.options.positionClass = 'toast-bottom-left';
            toastr.options.timeOut = 10000;
            toastr.options.showDuration = 0;
            toastr.options.hideDuration = 0;
            toastr.options.extendedTimeOut = 2000;

            this.listenTo(webgnome.model, 'sync', this.clearToasts);
        },

        render: function() {
            var compiled = _.template(LoggerTemplate);
            this.$el.append(LoggerTemplate);

            $('body').append(this.$el);

            if (localStorage.getItem('logger') != 'null' &&
                    !_.isNull(localStorage.getItem('logger'))) {
                this.toggle();
            }
        },

        toggle: function(e) {
            $('body').toggleClass('logger-open');
            this.$el.toggleClass('open');

            if (e) {
                if (localStorage.getItem('logger') != 'null') {
                    localStorage.setItem('logger', null);
                }
                else {
                    localStorage.setItem('logger', true);
                    this.windowScrollCheck(true);
                }
            }
        },

        socketConnect: function() {
            //console.log('Attaching logger socket routes...');
            console.log('Connecting to logger namespace');

            this.socket = io.connect(webgnome.config.socketio + this.socketRoute);

            this.socket.on('log', _.bind(this.socketLog, this));
            this.socket.on('logger_started', _.bind(this.loggerStarted,this));
            this.socket.emit('start_logger');
        },

        loggerStarted: function(event) {
            console.log('logger started on api');
        },

        socketLog: function(event) {
            this.log(event); 
            this.toast(event);
        },

        toast: function(message) {
            // capture the content between the '["' and the '"]'
            var msg, shortMsg;
            var re = /\[\"(.+)\"\]/g;

            if (message.level.toLowerCase() === 'criti') {
                msg = message.message;
                shortMsg = msg.split('\\n')[0];

                toastr.error(_.escape(shortMsg));
            }
            else if (message.level.toLowerCase() === 'warni') {
                msg = message.message;
                shortMsg = msg.split('\\n')[0];

                toastr.warning(_.escape(shortMsg));
            }
        },

        clearToasts: function() {
            toastr.clear();
        },

        /**
         * Print a log message to the window
         * @param  {Object or String}
         */
        log: function(message) {
            if (_.isString(message)) {
                this.$('.window .logs').append('<tr><td class="misc">' + message + '</td></tr>');
                this.count++;
            }

            if (_.isObject(message)) {
                if (! _.isUndefined(message.name)) {
                    var source = message.name.replace('[', '').split('.')[0];

                    if (source !== 'gnome' && source !== 'webgnome_api') {
                        source = 'misc';
                    }

                    var ts = message.time + ' ' + message.date;
                    this.$('.window .logs').append('<tr><td class="' + message.level.toLowerCase() + ' ' + source + '"><strong class="' + message.level.toLowerCase() +'">' + message.name + '</strong> ' + _.escape(message.message) + ' <div class="pull-right ' + message.level.toLowerCase() + '">' + ts + '</div></td></tr>');
                }
                else {
                    this.$('.window .logs').append('<tr><td class="misc">' + message.message + '</td></tr>');
                }

                this.count++;
            }

            if (this.count > this.limit) {
                this.$('.window .logs tr:first').remove();
                this.count--;
            }

            this.evalLogs();
            this.windowScrollCheck();
        },

        windowScrollCheck: function(force) {
            force = force ? true : false;
            var win = this.$('.window')[0];

            if (this.$el.hasClass('open') || force) {
                if (this.count * this.log_item_height + 25 - win.scrollTop - win.clientHeight < 25 || force) {
                    win.scrollTop = win.scrollHeight;
                }
            }            
        },

        evalLogs: function() {
            var errors = this.$('td.error, td.criti').length;
            var warnings = this.$('td.warni').length;

            if (errors > 0) {
                this.$el.addClass('error');
                this.$('.info .error .count').text(errors);
            }
            else {
                this.$el.removeClass('error');
                this.$('.info .error .count').text('');
            }

            if (warnings > 0) {
                this.$el.addClass('warning');
                this.$('.info .warning .count').text(warnings);
            }
            else {
                this.$el.removeClass('warning');
                this.$('.info .warning .count').text('');
            }
        },

        scroll: function(e, d) {
            var win = this.$('.window')[0];
            
            if ((win.scrollTop === (win.scrollHeight - win.clientHeight) && d < 0) ||
                    (win.scrollTop === 0 && d > 0)) {
                e.preventDefault();
            }
        },

        toggleViewable: function(e) {
            e.preventDefault();

            var a = this.$(e.target);
            var win = this.$('.window');
            
            a.toggleClass('active');
            win.toggleClass(a.attr('href').replace('#', ''));

            this.windowScrollCheck();
        },

        clearMessages: function(e) {
            e.preventDefault();
            
            this.$('.window .logs').html('');
            this.evalLogs();
            this.windowScrollCheck();
        },

        close: function() {
            this.clearToasts();
            Backbone.View.prototype.close.call(this);
        }
    });

    return loggerView;
});
