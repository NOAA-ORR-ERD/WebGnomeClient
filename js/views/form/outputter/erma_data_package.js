define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'module',
    'text!templates/form/outputter/erma_data_package.html',
    'views/form/outputter/base',
    'model/outputters/erma_data_package'
], function($, _, Backbone, moment, module, ERMADataPackageTemplate, OutputFormBase, ERMADataPackageOutputModel){
    'use strict';
    var ermaDataPackageOutputForm = OutputFormBase.extend({
        title: 'ERMADataPackage Output',

        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new ERMADataPackageOutputModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
        },

        render: function() {
            OutputFormBase.prototype.render.call(this);
            var start_time = moment(this.model.get('output_start_time')).format("YYYY-MM-DD HH:mm");
            var duration_hrs = webgnome.model.get("duration")/60/60;
            var timestamp_string = start_time + ' - ' + duration_hrs + 'hrs';

            // Add in any custom elements we want on the main export panel
            var default_erma_styling = this.model.get('default_erma_styling');
            var include_certain_particles = this.model.get('include_certain_particles');
            var include_uncertain_particles = this.model.get('include_uncertain_particles');
            var include_certain_boundary = this.model.get('include_certain_boundary');
            var include_uncertain_boundary = this.model.get('include_uncertain_boundary');
            var include_spill_location = this.model.get('include_spill_location');

            // Some of these do not have defaults because they need to be
            // dynamically timestamped etc at render time.  Do that now...
            var base_folder_name = this.model.get('base_folder_name');
            if (!base_folder_name) {
                // If we do not have a base folder name, lets set one
                base_folder_name = 'Testing Layers > Trajectories > Trajectory Model as of ' + moment().format("YYYY-MM-DD");
                this.model.set('base_folder_name', base_folder_name);
            }
            var model_folder_name = this.model.get('model_folder_name');
            if (!model_folder_name) {
                // If we do not have a model folder name, lets set one
                model_folder_name = "Trajectory for " + timestamp_string;
                this.model.set('model_folder_name', model_folder_name);
            }
            var certain_layer_name = this.model.get('certain_layer_name');
            if (!certain_layer_name) {
                certain_layer_name = "Best Estimate " + timestamp_string;
                this.model.set('certain_layer_name', certain_layer_name);
            }
            var uncertain_layer_name = this.model.get('uncertain_layer_name');
            if (!uncertain_layer_name) {
                uncertain_layer_name = "Uncertainty Estimate " + timestamp_string;
                this.model.set('uncertain_layer_name', uncertain_layer_name);
            }
            var certain_boundary_layer_name = this.model.get('certain_boundary_layer_name');
            if (!certain_boundary_layer_name) {
                certain_boundary_layer_name = "Best Estimate Boundary " + timestamp_string;
                this.model.set('certain_boundary_layer_name', certain_boundary_layer_name);
            }
            var uncertain_boundary_layer_name = this.model.get('uncertain_boundary_layer_name');
            if (!uncertain_boundary_layer_name) {
                uncertain_boundary_layer_name = "Uncertainty Boundary " + timestamp_string;
                this.model.set('uncertain_boundary_layer_name', uncertain_boundary_layer_name);
            }
            var certain_contours_layer_name = this.model.get('certain_contours_layer_name');
            if (!certain_contours_layer_name) {
                certain_contours_layer_name = "Best Estimate Contours " + timestamp_string;
                this.model.set('certain_contours_layer_name', certain_contours_layer_name);
            }

            var html = _.template(ERMADataPackageTemplate)({
                default_erma_styling: default_erma_styling,
                include_certain_particles: include_certain_particles,
                include_uncertain_particles: include_uncertain_particles,
                include_certain_boundary: include_certain_boundary,
                include_uncertain_boundary: include_uncertain_boundary,
                include_spill_location: include_spill_location,
                certain_layer_name: certain_layer_name,
                uncertain_layer_name: uncertain_layer_name,
                certain_boundary_layer_name: certain_boundary_layer_name,
                uncertain_boundary_layer_name: uncertain_boundary_layer_name,
                certain_contours_layer_name: certain_contours_layer_name,
                base_folder_name: base_folder_name,
                model_folder_name: model_folder_name
            });
            $(html).insertAfter(this.$("#base-form-divider"));
        },

        update: function(e) {
            // Handle updates if not a string based input.  In those cases, we look for blur below
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            if (!['base_folder_name','model_folder_name'].includes(name)) {
                OutputFormBase.prototype.update.call(this, e);
            }

            // Any other special case code specific to updates for the attributes
            // added special for this export form.
            //if (name === 'xxx') {
            //    this.model.set('xxx', value);
            //}
        },

        blur: function(e) {
            OutputFormBase.prototype.blur.call(this, e);
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            // For these string inputs we let the user type away, and only update the model
            // once they are done and we get a blur event.
            if (['base_folder_name','model_folder_name'].includes(name)) {
                this.model.set(name, value);
            }
        },

        save: function(options) {
            OutputFormBase.prototype.save.call(this, options);
        }
    });

    return ermaDataPackageOutputForm;
});
