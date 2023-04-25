define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/modal/base',
    'views/form/base',
    'text!templates/default/alert-danger.html',
    'views/default/help',
    'views/attributes/attributes'
], function($, _, Backbone, moment,
            BaseModal, BaseForm, AlertDangerTemplate,
            HelpView, AttributesView){
    'use strict';
    var PseudoMultipleInheritance = BaseForm.extend(BaseModal.prototype);
    var formModal = PseudoMultipleInheritance.extend({
        className: 'modal form-modal',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>' +
                 '<button type="button" class="save">Save</button>',
        form: [],

        events: {
            'click .next': 'save',
            'click .back': 'back',
            'show.bs.modal': 'triggerShown',
            'hide.bs.modal': 'triggerHidden',
            'shown.bs.modal': 'ready',
            'hidden.bs.modal': 'hidden',
            'click .modal-header>.close': 'wizardclose',
            'click .save': 'save',
            'click .finish': 'finish',
            'click .cancel': 'wizardclose',
            'click .wizard-cancel': 'wizardcancel',
            'click input': 'selectContents',
            'click .modal-header .gnome-help': 'showHelp',
            'change input:not(.attributes input)': 'update',
            'change select:not(.attributes select)': 'update',
        },

        initialize: function(options){
            BaseModal.prototype.initialize.call(this, options);
            if (this.module) {
                this.help = new HelpView({path: this.module.id});
            }
        },

        render: function(){
            BaseModal.prototype.render.call(this);
            if(this.model){
                this.sync();
                this.renderAttributes();
                this.model.on('change', this.renderAttributes, this);
            }
            //this is necessary for when the modal is re-rendered. Triggering 'ready' will cause the help
            //button to reappear in the modal header if it's not there already
            if (this.help && this.help.ready){
                this.help.trigger('ready');
            }
        },

        lockControls: function() {
            this.$('button').prop('disabled', true);
            //this.$('.save').prop('disabled', true);
            //this.$('.next').prop('disabled', true);
            //this.$('.cancel').prop('disabled', true);
        },

        unlockControls: function() {
            this.$('button').prop('disabled', false);
            //this.$('.save').prop('disabled', false);
            //this.$('.next').prop('disabled', false);
            //this.$('.cancel').prop('disabled', false);
        },

        stickyFooter: function(){
            var modal_offset = this.$el.offset();
            var footer_offset = this.$('.modal-footer:first').offset();
            modal_offset.top += $(window).height();
            footer_offset.top -= modal_offset.top;
            footer_offset.top += this.$('.modal-footer:first').outerHeight();
            var modal_height = this.$('.modal-dialog').height();
            var top = this.$el.scrollTop();
            var bottom;

            if (footer_offset.top > 0 && this.$('.sticky-modal-footer').length === 0){
                var modalClone = this.$('.modal-footer').clone();
                this.$('.modal-content').append(modalClone);
                this.$('.modal-footer:last').addClass('sticky-modal-footer');
                this.$('.modal-footer:last button').addClass('btn-sm btn');
                bottom = (modal_height - top - $(window).height());
                this.$('.sticky-modal-footer').css('bottom', bottom + 29 + 'px');
            } else if (footer_offset.top < 0 && this.$('.sticky-modal-footer').length > 0){
                this.$('.sticky-modal-footer').remove();
            } else {
                bottom = (modal_height - top - $(window).height());
                this.$('.sticky-modal-footer').css('bottom', bottom + 29 + 'px');
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
            if(this.$('.help-content.alert').length === 0){
                this.$('.modal-body').prepend(this.help.$el);
                this.help.delegateEvents();
            } else {
                this.help.$el.detach();
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
            if (_.isUndefined(this.scrollEvent)){
                this.scrollEvent = this.$el.on('scroll', _.bind(this.stickyFooter, this));
            }
            this.stickyFooter();
            $(window).on('resize.' + this.className, _.bind(function(){
                this.stickyFooter();
            }, this));
        },

        windowResize: function(){
            BaseModal.prototype.windowResize.call(this);
            this.stickyFooter();
        },

        hidden: function() {
            $(window).off('resize.' + this.className);
            this.trigger('hidden');
        },

        save: function(callback){
            if (this.superModel) {
                var opts = {
                    success: _.bind(function(){
                        this.trigger('save', this.superModel);
                        if(_.isFunction(callback)) { callback(); }
                        this.hide();
                    }, this),
                    error: _.bind(function(model, response){
                        this.error('Saving Failed!', 'Server responded with HTTP code: ' + response.status);
                    }, this)
                };
                if (this.superModel.isNew()) {
                    opts.validate = false;
                }
                if (this.model.isValid()) {
                    this.superModel.save(null, opts);
                }
                if (this.superModel.validationError || this.model.validationError){
                    this.error('Error:', this.superModel.validationError);
                    this.error('Error:', this.model.validationError);
                    this.$el.scrollTop(0);
                }
            } else if(this.model) {
                this.model.save(null, {
                    success: _.bind(function(mod){
                        this.trigger('save', mod);
                        if(_.isFunction(callback)) { callback(); }
                        this.hide();
                    }, this),
                    error: _.bind(function(model, response){
                        this.error('Saving Failed!', 'Server responded with HTTP code: ' + response.status);
                    }, this)
                });
                if (this.model.validationError){
                    this.error('Error:', this.model.validationError);
                    this.$el.scrollTop(0);
                }
            } else {
                this.trigger('save', this.$('form'));
                if(_.isFunction(callback)){ callback(); }
                this.hide();
            }
        },

        finish: function(){
            this.trigger('finish');
        },

        back: function() {
            this.hide();
            this.trigger('back');
        },

        renderAttributes: function(){
            if(this.attributes){
                this.attributes.remove();
            }
            if (this.superModel) {
                this.attributes = new AttributesView({name: this.superModel.get('obj_type'), model: this.superModel});
            } else {
                this.attributes = new AttributesView({name: this.model.get('obj_type'), model: this.model});
            }
            
            this.$('.modal-body').append(this.attributes.$el);
        },

        error: function(strong, message) {
            this.$('.modal-body .alert.validation').remove();
            this.$('.modal-body').prepend(_.template(AlertDangerTemplate)({strong: strong, message: message}));
        },

        clearError: function() {
            this.$('.modal-body .alert.validation').remove();
        },

        wizardclose: function(){
            if(this.model){
                this.model.fetch().then(_.bind(function(){
                    this.trigger('wizardclose');
                }, this));
            } else {
                this.trigger('wizardclose');
            }
        },

        wizardcancel: function(){
            //New-style cancel function for wizard use. Closes this form, leaving a possible parent form to pick
            //up the event
            this.trigger('close');
            this.close();
        },

        triggerHidden: function(){
            this.trigger('hidden.bs.modal');
        },

        triggerShown: function(){
            this.trigger('shown.bs.modal');
        },

        close: function(){
            $(window).off('resize.' + this.className);
            this.$('.xdsoft_datetimepicker').remove();
            this.$el.off('scroll');
            if(this.model){
                this.model.off('change', this.renderAttributes, this);
            }
            if ($('.modal').length == 1 && $('body').hasClass('modal-open')){
                //special case to undo the modal scroll lock if the save/submit button does not have data-dismiss='modal'
                $('body').removeClass('modal-open')
            }

            BaseModal.prototype.close.call(this);
        }
    });

    return formModal;
});
