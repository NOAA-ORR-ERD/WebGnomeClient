define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'lib/text!templates/default/alert-danger.html'
], function($, _, Backbone, BaseModal, AlertDangerTemplate){
    wizardModal = BaseModal.extend({
        className: 'modal fade new-wizard',

        initialize: function(options){
            if(options.body){
                this.body = options.body;
            }

            this.render();
        },

        events: {
            'click .next': 'next',
            'click .back': 'back',
            'hidden.bs.modal': 'close',
            'click .modal-header>.close': 'wizardclose',
            'click .cancel': 'wizardclose'
        },

        next: function(){
            this.trigger('next');
        },

        back: function(){
            this.trigger('back');
        },

        error: function(strong, message){
            this.$('.modal-body .alert').remove();
            this.$('.modal-body').prepend(_.template(AlertDangerTemplate, {strong: strong, message: message}));
        },

        isValid: function(){
            if (_.isFunction(this.validate)){
                var valid = this.validate();
                this.validationError = valid;
                console.log(valid);
                if (_.isUndefined(valid)) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        },

        wizardclose: function(){
            this.trigger('wizardclose');
        },

        close: function(){
            this.remove();
            this.unbind();
        }
    });

    return wizardModal;
});