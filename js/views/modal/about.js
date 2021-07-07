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
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Ok</button>',

        initialize: function() {
            var compiled = _.template(AboutTemplate)({'email': 'webgnome.help@noaa.gov'});
            this.body = compiled;
            BaseModal.prototype.initialize.call(this);
        }
    });

    return aboutModal;
});