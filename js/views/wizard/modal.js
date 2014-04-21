define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base'
], function($, _, Backbone, BaseModal){
    wizardModal = BaseModal.extend({
        className: 'modal fade new-wizard',

        initialize: function(){
            this.render();
        },

        events: {
            'click .next': 'next',
            'click .back': 'back',
            'hidden.bs.modal': 'close',
            'click .close': 'wizardclose',
            'click .cancel': 'wizardclose'
        },

        next: function(){
            this.hide();
            this.trigger('next');
        },

        back: function(){
            this.hide();
            this.trigger('back');
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