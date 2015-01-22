define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/loading.html'
], function($, _, Backbone, BaseModal, LoadingTemplate){
    var loadingModal = BaseModal.extend({
        name: 'loading',
        size: 'sm',
        title: 'Loading...',
        body: _.template(LoadingTemplate),
        buttons: '',

        events: function(){
            var loadingModalHash = BaseModal.prototype.events;
            delete loadingModalHash['hidden.bs.modal'];
            return loadingModalHash;
        },

        close: function(){
            BaseModal.prototype.close.call(this);
        }
    });

    return loadingModal;
});