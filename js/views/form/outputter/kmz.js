define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
], function($, _, Backbone, module, FormModal){
    'use strict';
    var kmzOutputForm = FormModal.extend({
        initialize: function(options, model){
            FormModal.prototype.initialize.call(this, options);
        }
    });

    return kmzOutputForm;
});