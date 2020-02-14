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

        initialize: function(options) {
            BaseModal.prototype.initialize.call(this, options)
            this.percent = 0;
            this.setupListeners();
        },

        setupListeners: function() {
            this.listenTo(webgnome.cache, 'step:received', this.updateProgress);
            this.listenTo(webgnome.cache, 'complete', this.requestOutputFiles);
        },

        render: function(){
            BaseModal.prototype.render.call(this);
            //this.$('.close').hide();
            this.progressbar = this.$('.progress-bar');
            webgnome.cache.getSteps();
        },

        updateProgress: _.throttle(function(){
            this.percent = Math.round(((webgnome.cache.length) / (webgnome.model.get('num_time_steps') - 1)) * 100);
            this.progressbar.css('width', this.percent + '%');
        }, 100),

        cutShort: function() {

        },

        requestOutputFiles() {
            this.$('.modal-header > h4').text('Retreiving output files...');
            console.log('model complete! requesting zip with output files')
        },

        cancelRun: function(e) {
            e.preventDefault();
            console.log(e);
            if (!webgnome.cache.isDead || !webgnome.cache.streaming)
            this.listenToOnce(webgnome.cache, 'step:failed', _.bind(function() {
                this.close();
            }), this);
            webgnome.cache.rewind();
            this.$(e.currentTarget).text("Canceling...");
            this.$(e.currentTarget).addClass('disabled');
        }


    });

    return progressModal;
});