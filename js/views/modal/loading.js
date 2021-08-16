define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/loading.html'
], function($, _, Backbone, BaseModal, LoadingTemplate){
    'use strict';
    var loadingModal = BaseModal.extend({
        name: 'loading',
        size: 'sm',
        title: 'Loading...',
        body: _.template(LoadingTemplate)(),
        buttons: '',

        render: function(){
            BaseModal.prototype.render.call(this);
            this.$('.close').hide();
            this.$('.modal-footer').hide();
        }
    });

    return loadingModal;
});