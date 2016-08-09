define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
], function($, _, Backbone, module, NetCDFOutputTemplate, FormModal){
    'use strict';
    var netCDFOutputForm = FormModal.extend({
        initialize: function(options, model){
            if (!_.isUndefined(model)) {
                this.model = model;
            }

            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options) {
            this.body = _.template(KMZOutputTemplate, {

            });

            FormModal.prototype.render.call(this, options);
        }
    });

    return netCDFOutputForm;
});