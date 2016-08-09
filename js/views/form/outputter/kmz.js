define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
], function($, _, Backbone, module, KMZOutputTemplate, FormModal){
    'use strict';
    var kmzOutputForm = FormModal.extend({
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

    return kmzOutputForm;
});