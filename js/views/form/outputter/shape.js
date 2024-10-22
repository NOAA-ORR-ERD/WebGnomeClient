define([
    'jquery',
    'underscore',
    'backbone',
    'moment-timezone',
    'tzlookup',
    'module',
    'text!templates/form/outputter/shapefile.html',
    'views/form/outputter/base',
    'model/outputters/shape'
], function($, _, Backbone, moment, tzlookup, module, ShapefileTemplate, OutputFormBase, ShapeOutputModel){
    'use strict';
    var shapeFileOutputForm = OutputFormBase.extend({
        title: 'Shapefile Output',

        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new ShapeOutputModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
        },

        render: function() {
            OutputFormBase.prototype.render.call(this);
            // Default the outputter to the timezone at the model location
            // Currently this is just done by matching SDT at the locations timezone,
            // but in the future we can also verify DST at the location and
            // handle the special case if they do not match our standard options.
            var timeoffset = this.model.get('timeoffset');
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
                var offset_minutes = moment(this.model.get('output_start_time')).tz(timezone_name).utcOffset();
                this.isDST = moment(this.model.get('output_start_time')).tz(timezone_name).isDST();
                timeoffset = offset_minutes/60;
                this.model.set('timeoffset', timeoffset);
                this.timezone_default = timezone_name;
            }
            var dst_string = !!this.isDST ? 'Daylight Savings Time' : 'Standard Time';
            var timeoffsetObj = this.timeOffsetOptions().find(function (x) {return x.offset === timeoffset;});
            var timeoffset_string = timeoffsetObj.offset_string;
            var num_spills = webgnome.model.get('spills').length;
            var html = _.template(ShapefileTemplate)({
                num_spills: num_spills,
                timeOffsetOptions: this.timeOffsetOptions(),
                timeoffset: timeoffset,
                timeoffset_string: timeoffset_string,
                dst_string: dst_string,
            });
            $(html).insertAfter(this.$("#base-form-divider"));
        },

        update: function(e) {
            // Handle updates if not a string based input.  In those cases, we look for blur below
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
            if (!['timeoffset'].includes(name)) {
                OutputFormBase.prototype.update.call(this, e);
            }

            if (name === 'timeoffset') {
                this.model.set('timeoffset', parseInt(value));
            }
            // Any other special case code specific to updates for the attributes
            // added special for this export form.
            //if (name === 'xxx') {
            //    this.model.set('xxx', value);
            //}
        },

        save: function(options) {
            if (webgnome.model.get('uncertain') === true) {
                this.model.set('zip_output', true);
            }
            OutputFormBase.prototype.save.call(this, options);
        }
    });

    return shapeFileOutputForm;
});
