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
        timezone_default: '',
        timezone_default_offsets: '',
        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new ERMADataPackageOutputModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
            this.model.on('change:output_start_time', this.updateTimeBasedNames, this);
            this.model.on('change:timezone', this.updateTimeBasedNames, this);
        },

        updateTimeBasedNames: function() {
            var timezone = this.model.get('timezone');
            var timezoneObj = this.timezoneOptions().find(function (x) {return x.timezone === timezone;});
            var start_time = moment.tz(this.model.get('output_start_time'), timezone).format("YYYY-MM-DD HH:mmZ");
            var duration_hrs = webgnome.model.get("duration")/60/60;
            var timestamp_string = start_time +' - ' + duration_hrs + 'hrs';
            // Reset all the names if the time changes.
            var model_folder_name = "Trajectory for " + timestamp_string;
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
            var timezone = this.model.get('timezone');
            var timezoneObj;
            if (!timezone) {
                var timezone_name = '';
                // First we try to see if we have a time and location we can make an
                // assumption for timezone
                var model_spills = webgnome.model.get('spills');
                if (1===0) { //(model_spills.length > 0) { //DISABLED hotfix (temp) 11/5/2024
                    var centroid = model_spills.models[0].get('release').get('centroid');
                    timezone_name = tzlookup(centroid[1],centroid[0]);
                } else {
                    // We default back to end users current timezone if all else fails
                    timezone_name = moment.tz.guess();
                }
                var timezone_offset_local = moment().startOf('year').tz(timezone_name).format('Z');
                timezoneObj = this.timezoneOptions().find(function (x) {return x.offset === timezone_offset_local;});
                timezone = timezoneObj.timezone;
                this.timezone_default = timezoneObj.timezone;
                this.timezone_default_offsets = timezoneObj.sdtDstOffsets;
                this.model.set('timezone', timezone);
            }
            timezoneObj = this.timezoneOptions().find(function (x) {return x.timezone === timezone;});
            var timezone_offsets = timezoneObj.sdtDstOffsets;

            var start_time = moment.tz(this.model.get('output_start_time'), timezone).format("YYYY-MM-DD HH:mmZ");
            var duration_hrs = webgnome.model.get("duration")/60/60;
            var timestamp_string = start_time + ' - ' + duration_hrs + 'hrs';
            var num_spills = webgnome.model.get('spills').length;

            // Add in any custom elements we want on the main export panel
            var default_erma_styling = this.model.get('default_erma_styling');
            var include_certain_particles = this.model.get('include_certain_particles');
            var include_uncertain_particles = this.model.get('include_uncertain_particles');
            var include_certain_boundary = this.model.get('include_certain_boundary');
            var include_uncertain_boundary = this.model.get('include_uncertain_boundary');
            var include_certain_in_uncertain_boundary = this.model.get('include_certain_in_uncertain_boundary');
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
                start_time: start_time,
                num_spills: num_spills,
                default_erma_styling: default_erma_styling,
                include_certain_particles: include_certain_particles,
                include_uncertain_particles: include_uncertain_particles,
                include_certain_boundary: include_certain_boundary,
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
                timezoneOptions: this.timezoneOptions(),
                // Grab the tz offset at the beginning of the year to get standard time
                // for the users current location
                timezone_offsets: timezone_offsets,
                timezone: timezone,
                timezone_default: this.timezone_default,
                timezone_default_offsets: this.timezone_default_offsets,
                uncertain: webgnome.model.get('uncertain')
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
        },

        timezoneOptions: function() {
            var timezones = [
                {
                    offset: '-12:00',
                    sdtDstOffsets: '-12:00/-12:00',
                    title: 'Baker Island (Pacific/Wallis)',
                    timezone: 'Pacific/Wallis'
                },
                {
                    offset: '-11:00',
                    sdtDstOffsets: '-11:00/-11:00',
                    title: 'Samoa (Pacific/Pago_Pago)',
                    timezone: 'Pacific/Pago_Pago'
                },
                {
                    offset: '-10:00',
                    sdtDstOffsets: '-10:00/-10:00',
                    title: 'Hawaii-Aleutian (US/Hawaii)',
                    timezone: 'US/Hawaii'
                },
                {
                    offset: '-09:00',
                    sdtDstOffsets: '-09:00/-08:00',
                    title: 'Alaska / Aleutian (US/Alaska)',
                    timezone: 'US/Alaska'
                },
                {
                    offset: '-08:00',
                    sdtDstOffsets: '-08:00/-07:00',
                    title: 'Pacific (US/Pacific)',
                    timezone: 'US/Pacific'
                },
                {
                    offset: '-07:00',
                    sdtDstOffsets: '-07:00/-06:00',
                    title: 'Mountain (US/Mountain)',
                    timezone: 'US/Mountain'
                },
                {
                    offset: '-06:00',
                    sdtDstOffsets: '-06:00/-05:00',
                    title: 'Central (US/Central)',
                    timezone: 'US/Central'
                },
                {
                    offset: '-05:00',
                    sdtDstOffsets: '-05:00/-04:00',
                    title: 'Eastern (US/Eastern)',
                    timezone: 'US/Eastern'
                },
                {
                    offset: '-04:00',
                    sdtDstOffsets: '-04:00/-03:00',
                    title: 'Atlantic (Canada/Atlantic)',
                    timezone: 'Canada/Atlantic'
                },
                {
                    offset: '-03:00',
                    sdtDstOffsets: '-03:00/-03:00',
                    title: 'Brazil (America/Sao_Paulo)',
                    timezone: 'America/Sao_Paulo'
                },
                {
                    offset: '-02:00',
                    sdtDstOffsets: '-02:00/-02:00',
                    title: 'Mid-Atlantic (America/Noronha)',
                    timezone: 'America/Noronha'
                },
                {
                    offset: '-01:00',
                    sdtDstOffsets: '-01:00/-00:00',
                    title: 'Azores (Atlantic/Azores)',
                    timezone: 'Atlantic/Azores'
                },
                {
                    offset: '+00:00',
                    sdtDstOffsets: '+00:00/+00:00',
                    title: 'Coordinated Universal Time (UTC)',
                    timezone: 'UTC'
                },
                {
                    offset: '+00:00',
                    sdtDstOffsets: '+00:00/+01:00',
                    title: 'Western European (Europe/London)',
                    timezone: 'Europe/London'
                },
                {
                    offset: '+01:00',
                    sdtDstOffsets: '+01:00/+02:00',
                    title: 'Central European (Europe/Amsterdam)',
                    timezone: 'Europe/Amsterdam'
                },
                {
                    offset: '+02:00',
                    sdtDstOffsets: '+02:00/+03:00',
                    title: 'Eastern European (Europe/Athens)',
                    timezone: 'Europe/Athens'
                },
                {
                    offset: '+03:00',
                    sdtDstOffsets: '+03:00/+03:00',
                    title: 'Moscow / East Africa (Europe/Moscow)',
                    timezone: 'Europe/Moscow'
                },
                {
                    offset: '+04:00',
                    sdtDstOffsets: '+04:00/+04:00',
                    title: 'Gulf (Asia/Dubai)',
                    timezone: 'Asia/Dubai'
                },
                {
                    offset: '+05:00',
                    sdtDstOffsets: '+05:00/+05:00',
                    title: 'West Asia (Asia/Tashkent)',
                    timezone: 'Asia/Tashkent'
                },
                {
                    offset: '+06:00',
                    sdtDstOffsets: '+06:00/+06:00',
                    title: 'Central Asia (Asia/Dhaka)',
                    timezone: 'Asia/Dhaka'
                },
                {
                    offset: '+07:00',
                    sdtDstOffsets: '+07:00/+07:00',
                    title: 'Western Indonesian (Asia/Bangkok)',
                    timezone: 'Asia/Bangkok'
                },
                {
                    offset: '+08:00',
                    sdtDstOffsets: '+08:00/+08:00',
                    title: 'Central Indonesian (Asia/Manila)',
                    timezone: 'Asia/Manila'
                },
                {
                    offset: '+09:00',
                    sdtDstOffsets: '+09:00/+09:00',
                    title: 'Eastern Indonesian (Asia/Tokyo)',
                    timezone: 'Asia/Tokyo'
                },
                {
                    offset: '+10:00',
                    sdtDstOffsets: '+10:00/+10:00',
                    title: 'Chamorro (Guam) (Pacific/Port_Moresby)',
                    timezone: 'Pacific/Port_Moresby'
                },
                {
                    offset: '+11:00',
                    sdtDstOffsets: '+11:00/+11:00',
                    title: 'Central Pacific (Pacific/Guadalcanal)',
                    timezone: 'Pacific/Guadalcanal'
                },
                {
                    offset: '+12:00',
                    sdtDstOffsets: '+12:00/+12:00',
                    title: 'Wake Island (Pacific/Wake)',
                    timezone: 'Pacific/Wake'
                },
                {
                    offset: '+13:00',
                    sdtDstOffsets: '+13:00/+13:00',
                    title: 'Samoa (Pacific/Samoa)',
                    timezone: 'Pacific/Samoa'
                },
                {
                    offset: '+14:00',
                    sdtDstOffsets: '+14:00/+14:00',
                    title: 'Line Islands (Pacific/Kiritimati)',
                    timezone: 'Pacific/Kiritimati'
                }
            ];
            return timezones;
        }
    });
    return ermaDataPackageOutputForm;
});
