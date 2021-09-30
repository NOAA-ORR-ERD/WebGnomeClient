define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/hotkeys.html'
], function($, _, Backbone, BaseModal, HotkeysTemplate){
    'use strict';
    var hotkeysModal = BaseModal.extend({
        name: 'hotkeys',
        size: 'sm',
        title: 'Map View Hotkeys',
        body: _.template(HotkeysTemplate)(),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Ok</button>'
    });

    return hotkeysModal;
});