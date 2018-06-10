define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/mover/base',
    'text!templates/form/mover/edit.html',
    'views/modal/form'
], function($, _, Backbone, module, BaseMoverForm, FormTemplate, FormModal) {
    'use strict';
    var modelForm = BaseMoverForm.extend({

        events: function() {
            return _.defaults({
                'click div :checkbox': 'setExtrapolation',
            }, BaseMoverForm.prototype.events);
        },

        render: function(options) {
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('scale_value'),
                extrapolation_is_allowed: this.model.get('current').get('extrapolation_is_allowed')
            });

            FormModal.prototype.render.call(this, options);
        },

        setExtrapolation: function(e) {
            var selected = $(e.target).is(':checked');
            this.model.get('current').set('extrapolation_is_allowed', selected);
        },
    });

    return modelForm;
});