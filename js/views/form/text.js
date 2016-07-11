define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
], function($, _, Backbone, module, FormModal){
    'use strict';
    var textForm = FormModal.extend({
        initialize: function(options, modal){
            this.module = module;
            if (options.moduleId) {
                this.module.id = options.moduleId;
            }
            FormModal.prototype.initialize.call(this, options);
        }
    });

    return textForm;
});