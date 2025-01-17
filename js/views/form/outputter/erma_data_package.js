define([
    'jquery',
    'underscore',
    'backbone',
    'moment-timezone',
    'tzlookup',
    'module',
    'text!templates/form/outputter/erma_data_package.html',
    'views/form/outputter/base',
    'model/outputters/erma_data_package'
], function($, _, Backbone, moment, tzlookup, module, ERMADataPackageTemplate, OutputFormBase, ERMADataPackageOutputModel){
    'use strict';
    var ermaDataPackageOutputForm = OutputFormBase.extend({
        title: 'ERMADataPackage Output',
        isDST: false,
        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new ERMADataPackageOutputModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
            this.model.on('change:output_start_time', this.updateTimeBasedNames, this);
            this.model.on('change:timeoffset', this.updateTimeBasedNames, this);
        },

        updateTimeBasedNames: function() {
            var timeoffset = this.model.get('timeoffset');
            var timeoffsetObj = this.timeOffsetOptions.find(function (x) {return x.offset === timeoffset;});
            var start_time = moment(this.model.get('output_start_time')).utcOffset(timeoffset).format("YYYY-MM-DD HH:mm");
            var start_time_with_offset = moment(this.model.get('output_start_time')).utcOffset(timeoffset).format("YYYY-MM-DD HH:mm (UTCZ)");
            var duration_hrs = webgnome.model.get("duration")/60/60;
            var timestamp_string = start_time + ' - ' + duration_hrs + 'hrs';
            var timestamp_string_with_offset = start_time_with_offset + ' - ' + duration_hrs + 'hrs';
            // Reset all the names if the time changes.
            var model_folder_name = "Trajectory for " + timestamp_string_with_offset;
            this.model.set('model_folder_name', model_folder_name);
            var certain_layer_name = "Best Estimate " + timestamp_string;
            this.model.set('certain_layer_name', certain_layer_name);
            var uncertain_layer_name = "Uncertainty Estimate " + timestamp_string;
            this.model.set('uncertain_layer_name', uncertain_layer_name);
            var certain_boundary_layer_name = "Best Estimate Boundary " + timestamp_string;
            this.model.set('certain_boundary_layer_name', certain_boundary_layer_name);
            var uncertain_boundary_layer_name = "Uncertainty Boundary " + timestamp_string;
            this.model.set('uncertain_boundary_layer_name', uncertain_boundary_layer_name);
            var certain_contours_layer_name = "Best Estimate Contours " + timestamp_string;
            this.model.set('certain_contours_layer_name', certain_contours_layer_name);
        },

        render: function() {
            OutputFormBase.prototype.render.call(this);

            // Default the outputter to the timezone at the model location
            // Currently this is just done by matching SDT at the locations timezone,
            // but in the future we can also verify DST at the location and
            // handle the special case if they do not match our standard options.
            var timeoffset = webgnome.model.get('timezone_offset').get('offset');
            if (_.isNull(timeoffset)) {
                var timezone_name = '';
                // First we try to see if we have a time and location we can make an
                // assumption for timezone
                var model_spills = webgnome.model.get('spills');
                if (model_spills.length > 0) {
                    var centroid = model_spills.models[0].get('release').get('centroid');
                    timezone_name = tzlookup(centroid[1],centroid[0]);
                } else {
                    // We default back to end users current timezone if all else fails
                    timezone_name = moment.tz.guess();
                }
                if (_.isUndefined(timezone_name)) {
                    timezone_name = "UTC";
                }
                var offset_minutes = moment(this.model.get('output_start_time')).tz(timezone_name).utcOffset();
                this.isDST = moment(this.model.get('output_start_time')).tz(timezone_name).isDST();
                timeoffset = offset_minutes/60;
                this.model.set('timeoffset', timeoffset);
                this.timezone_default = timezone_name;
            }
            var dst_string = !!this.isDST ? 'Daylight Savings Time' : 'Standard Time';
            var timeoffsetObj = this.timeOffsetOptions.find(function (x) {return x.offset === timeoffset;});
            var timeoffset_string = '';
            if (_.isUndefined(timeoffsetObj)) {
                // If we cant find it
                var index = 0;
                for (const [i,e] of this.timeOffsetOptions.entries()) {
                    if (timeoffset < e.offset) {
                        // Found it
                        index = i;
                        break;
                    }
                    // If last one... just insert after last index
                    if (i+1 === this.timeOffsetOptions.length) {
                        index = i+1;
                        break;
                    }
                }
                // Insert where needed
                var offsetSign = (timeoffset >= 0) ? "+" : "-";
                var offsetHour = (Math.abs(parseInt(timeoffset))).toString().padStart(2,'0');
                var offsetMinutes = Math.abs(((timeoffset % 1) * 60).toFixed(2));
                timeoffset_string = offsetSign + offsetHour + ':' + offsetMinutes;
                var offsetOption = {offset:timeoffset, offset_string:timeoffset_string, title:'UTC'+timeoffset_string};
                this.timeOffsetOptions.splice(index, 0, offsetOption);
            } else {
                timeoffset_string = timeoffsetObj.offset_string;
            }
            var start_time = moment(this.model.get('output_start_time')).utcOffset(timeoffset).format("YYYY-MM-DD HH:mm");
            var start_time_with_offset = moment(this.model.get('output_start_time')).utcOffset(timeoffset).format("YYYY-MM-DD HH:mm (UTCZ)");
            var duration_hrs = webgnome.model.get("duration")/60/60;
            var timestamp_string = start_time + ' - ' + duration_hrs + 'hrs';
            var timestamp_string_with_offset = start_time_with_offset + ' - ' + duration_hrs + 'hrs';
            var num_spills = webgnome.model.get('spills').length;

            // Add in any custom elements we want on the main export panel
            var default_erma_styling = this.model.get('default_erma_styling');
            var include_certain_particles = this.model.get('include_certain_particles');
            var include_uncertain_particles = this.model.get('include_uncertain_particles');
            var include_certain_boundary = this.model.get('include_certain_boundary');
            var include_certain_contours = this.model.get('include_certain_contours');
            var include_uncertain_boundary = this.model.get('include_uncertain_boundary');
            var include_certain_in_uncertain_boundary = this.model.get('include_certain_in_uncertain_boundary');
            var include_spill_location = this.model.get('include_spill_location');
            var enable_each_timestep_as_layer = this.model.get('enable_each_timestep_as_layer');

            // Some of these do not have defaults because they need to be
            // dynamically timestamped etc at render time.  Do that now...
            var base_folder_name = this.model.get('base_folder_name');
            if (!base_folder_name) {
                // If we do not have a base folder name, lets set one
                base_folder_name = 'Testing Layers > Trajectories > Trajectory Model as of ' + moment().format("YYYY-MM-DD HH:mm:ss");
                this.model.set('base_folder_name', base_folder_name);
            }
            var model_folder_name = this.model.get('model_folder_name');
            if (!model_folder_name) {
                // If we do not have a model folder name, lets set one
                model_folder_name = "Trajectory for " + timestamp_string_with_offset;
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
                start_time: start_time,
                num_spills: num_spills,
                default_erma_styling: default_erma_styling,
                enable_each_timestep_as_layer: enable_each_timestep_as_layer,
                include_certain_particles: include_certain_particles,
                include_uncertain_particles: include_uncertain_particles,
                include_certain_boundary: include_certain_boundary,
                include_certain_contours: include_certain_contours,
                include_uncertain_boundary: include_uncertain_boundary,
                include_certain_in_uncertain_boundary: include_certain_in_uncertain_boundary,
                include_spill_location: include_spill_location,
                certain_layer_name: certain_layer_name,
                uncertain_layer_name: uncertain_layer_name,
                certain_boundary_layer_name: certain_boundary_layer_name,
                uncertain_boundary_layer_name: uncertain_boundary_layer_name,
                certain_contours_layer_name: certain_contours_layer_name,
                base_folder_name: base_folder_name,
                model_folder_name: model_folder_name,
                timeOffsetOptions: this.timeOffsetOptions,
                // Grab the tz offset at the beginning of the year to get standard time
                // for the users current location
                timeoffset: timeoffset,
                timeoffset_string: timeoffset_string,
                dst_string: dst_string,
                uncertain: webgnome.model.get('uncertain')
            });
            $(html).insertAfter(this.$("#base-form-divider"));
        },

        update: function(e) {
            // Handle updates if not a string based input.  In those cases, we look for blur below
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            if (!['base_folder_name','model_folder_name', 'timeoffset'].includes(name)) {
                OutputFormBase.prototype.update.call(this, e);
            }

            if (name === 'timeoffset') {
                this.model.set('timeoffset', parseFloat(value));
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
