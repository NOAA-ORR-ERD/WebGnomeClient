define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/changeLog.html'
], function($, _, Backbone, BaseModal, AboutTemplate){
    'use strict';
    var ChangeLogModal = BaseModal.extend({
        name: 'changeLog',
        size: 'lg',
        title: 'Recent Feature Updates and Changes',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Ok</button>',

        initialize: function() {
            var compiled = _.template(AboutTemplate)({'email': 'webgnome.help@noaa.gov'});
            this.body = compiled;
            BaseModal.prototype.initialize.call(this);
        }
    });

    return ChangeLogModal;
});