define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/default/alert-danger.html'
], function($, _, Backbone, BaseModal, AlertDangerTemplate){
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
            'click .finish': 'finish'
        },

        ready: function() {
            this.trigger('ready');
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
            this.$('.modal-body .alert').remove();
            this.$('.modal-body').prepend(_.template(AlertDangerTemplate, {strong: strong, message: message}));
        },

        clearError: function() {
            this.$('.modal-body .alert').remove();
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