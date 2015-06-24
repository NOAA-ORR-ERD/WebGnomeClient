define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/about.html'
], function($, _, Backbone, BaseModal, AboutTemplate){
    'use strict';
    var aboutModal = BaseModal.extend({
        name: 'about',
        size: 'sm',
        title: 'About WebGNOME&reg;',
        body: _.template(AboutTemplate),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Ok</button>',
    });

    return aboutModal;
});