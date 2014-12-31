define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/default/alert-danger.html',
    'views/default/help'
], function($, _, Backbone, BaseModal, AlertDangerTemplate, HelpView){
    formModal = BaseModal.extend({
        className: 'modal fade form-modal',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        form: [],

        events: {
            'click .next': 'save',
            'click .back': 'back',
            'shown.bs.modal': 'ready',
            'hidden.bs.modal': 'hidden',
            'click .modal-header>.close': 'wizardclose',
            'click .save': 'save',
            'click .cancel': 'wizardclose',
            'change input': 'update',
            'keyup input': 'update',
            'change select': 'update',
            'click .finish': 'finish',
            'click .modal-header .gnome-help': 'showHelp'
        },

        initialize: function(options){
            BaseModal.prototype.initialize.call(this, options);
            if (this.module) {
                this.help = new HelpView({path: this.module.id});
            }
        },

        stickyFooter: function(){
            var win_top = $(window).scrollTop();
            var modal_top = $('.modal').scrollTop();
            var modal_offset = $('.modal-footer:first').offset();
            var modal_height = $('.modal').height();
            //var modal_padding = $('.modal').css('padding-top');
            var modal_footer_height = $('.modal-footer').height();

            var window_bottom = win_top + $(window).height();
            var modal_footer_height_adjusted = modal_offset.top + modal_height - modal_footer_height;

            console.log(window_bottom);
            console.log(modal_footer_height_adjusted);

            if (window_bottom < modal_footer_height_adjusted && $('.sticky').length === 0){
                $('.modal-footer').clone().appendTo('.modal-content');
                $('.modal-footer:last').addClass('sticky');
            } else if (window_bottom > modal_footer_height_adjusted && $('.sticky').length > 0){
                $('.sticky').remove();
            } else {
                $('.sticky').css('top', modal_top - 300 + 'px');
            }
        },

        renderHelp: function(){
            if(this.$('.modal-header').length > 0){
                if(this.$('.modal-header .gnome-help').length === 0){
                    var button = '<div class="gnome-help" title="Click for help"></div>';
                    this.$('.modal-header h4').append(button);
                    this.$('.modal-header .gnome-help').tooltip();
                }
            } else {
                this.on('ready', this.renderHelp, this);
            }
        },

        showHelp: function(){
            if(this.$('.gnome-help.alert').length === 0){
                this.$('.modal-body').prepend(this.help.$el);
                this.help.delegateEvents();
            }
        },

        ready: function() {
            this.trigger('ready');
            if(!_.isUndefined(this.help)){
                if(this.help.ready){
                    this.renderHelp();
                } else {
                    this.help.on('ready', this.renderHelp, this);
                }
            }
            this.$el.on('scroll', this.stickyFooter);
        },

        hidden: function() {
            this.trigger('hidden');
        },

        save: function(callback){
            if(this.model){
                this.model.save(null, {
                    success: _.bind(function(){
                        this.hide();
                        this.trigger('save', [this.model]);
                        if(_.isFunction(callback)) callback();
                    }, this),
                    error: _.bind(function(model, response){
                        this.error('Saving Failed!', 'Server responded with HTTP code: ' + response.status);
                    }, this)
                });
                if (this.model.validationError){
                    this.error('Error', this.model.validationError);
                }
            } else {
                this.hide();
                this.trigger('save', [this.model]);
                if(_.isFunction(callback)) callback();
            }
        },

        back: function() {
            this.hide();
            this.trigger('back');
        },

        error: function(strong, message) {
            this.$('.modal-body .alert.validation').remove();
            this.$('.modal-body').prepend(_.template(AlertDangerTemplate, {strong: strong, message: message}));
        },

        clearError: function() {
            this.$('.modal-body .alert.validation').remove();
        },

        isValid: function() {
            if (_.isFunction(this.validate)){
                var valid = this.validate();
                if (_.isUndefined(valid)) {
                    this.validationError = null;
                    return true;
                }
                this.validationError = valid;
                return false;
            } else {
                return true;
            }
        },

        validate: function() {
            if (!_.isUndefined(this.model)) {
                if (this.model.isValid()) {
                    return;
                }
                return this.model.validationError;
            }
        },

        wizardclose: function(){
            if(this.model){
                this.model.fetch();
            }
            this.trigger('wizardclose');
        },

        finish: function(){
            this.on('hidden', function(){
                this.trigger('finish');
                webgnome.model.fetch();
                webgnome.router.navigate('model', true);
            });
            this.hide();
        },

        close: function(){
            this.remove();
            this.unbind();
        }
    });

    return formModal;
});