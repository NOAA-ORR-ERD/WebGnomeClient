define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'text!templates/form/mover/edit.html',
    'views/modal/form'
], function($, _, Backbone, module, FormTemplate, FormModal) {
    'use strict';
    var currentForm = FormModal.extend({
            
        className: 'modal form-modal model-form',
        title: 'Gridded Currents ',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        
        initialize: function(options, model){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },

        events: function() {
            return _.defaults({
                'click div :checkbox': 'setExtrapolation',
            }, FormModal.prototype.events);
        },

        render: function(options) {
            var extrapolation_allowed = false;
            var start_time;
            var end_time;
            var current = this.model.get('current');
            if (current) {
                extrapolation_allowed = current.get('extrapolation_is_allowed');
                start_time = current.get('data_start');
                end_time = current.get('data_stop');
            }
            else {
                // The C++ based GridCurrentMover does not have a composed
                // GridCurrent object, so we need to make this exceptional
                // case.
                extrapolation_allowed = this.model.get('extrapolate');
                start_time = this.model.get('data_start');
                end_time = this.model.get('data_stop');
            }

            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('current_scale'),
                extrapolation_is_allowed: extrapolation_allowed,
                start_time: start_time,
                end_time: end_time
            });

            FormModal.prototype.render.call(this, options);
        },

        setExtrapolation: function(e) {
            var selected = $(e.target).is(':checked');

            var current = this.model.get('current');
            if (current) {
                current.set('extrapolation_is_allowed', selected);
            }
            else {
                // The C++ based GridCurrentMover does not have a composed
                // GridCurrent object, so we need to make this exceptional
                // case.
                this.model.set('extrapolate', selected);
            }

        },
    });

    return currentForm;
});