define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/progressbar.html'
], function($, _, Backbone, BaseModal, ProgressTemplate){
    'use strict';
    var progressModal = BaseModal.extend({
        name: 'loading',
        size: 'sm',
        title: 'Loading...',
        body: _.template(ProgressTemplate),
        buttons: '<button type="button" class="cancel">Cancel</button>',

        events: {
            'click .cancel': 'cancelRun',
            'click .cut-short': 'cutShort'
        },

        initialize: function(options, payload) {
            BaseModal.prototype.initialize.call(this, options);
            this.percent = 0;
            this.setupListeners();
            this.payload=payload;
        },

        setupListeners: function() {
            this.listenTo(webgnome.cache, 'step:received', this.updateProgress);
        },

        render: function(){
            BaseModal.prototype.render.call(this);
            //this.$('.close').hide();
            this.progressbar = this.$('.progress-bar');
            this.startExportRun('/ws_export');
        },

        startExportRun: function(url) {
            var c = webgnome.cache;
            if(!c.streaming && !c.isDead) {
                // this is this.socket.connected in socket.io v1.0+
                if(!c.socket){
                    c.socketConnect();
                }
                c.preparing = true;
                $.ajax({
                    url: url,
                    type: 'PUT',
                    success: _.bind(function(step) {
                        console.log('getSteps success!');
                    }, this),
                    error: _.bind(function(){
                        console.error('getSteps error!');
                        webgnome.cache.preparing = false;
                    }, this),
                    data: JSON.stringify(this.payload),
                    contentType: 'application/json'
                });
            }
            this.listenToOnce(c.socket, 'export_finished', _.bind(this.requestOutputFile, this));
            this.listenToOnce(c.socket, 'export_failed', _.bind(this.cancelRun ,this));
        },

        updateProgress: _.throttle(function(){
            this.percent = Math.round(((webgnome.cache.length) / (webgnome.model.get('num_time_steps') - 1)) * 100);
            this.progressbar.css('width', this.percent + '%');
        }, 100),

        requestOutputFile(filename) {
            this.$('.modal-header > h4').text('Retreiving output files...');
            console.log('model complete! requesting zip with output files');
            this.$('.cancel').addClass('disabled');
            window.location.href = webgnome.config.api + '/ws_export?filename=' + filename;
            this.stopListening(webgnome.cache);
            webgnome.cache.rewind(true);
            setTimeout(_.bind(function() {webgnome.cache.rewind(); this.hide();}, this), 2000);
        },

        cancelRun: function(e) {
            e.preventDefault();
            console.log(e);
            var to = setTimeout(this.hide, 3000);
            this.listenToOnce(webgnome.cache, 'rewind', _.bind(function() {
                clearTimeout(to);
                this.hide();
            }, this));
            webgnome.cache.rewind(true);
            this.$(e.currentTarget).text("Canceling...");
            this.$(e.currentTarget).addClass('disabled');
        }


    });

    return progressModal;
});