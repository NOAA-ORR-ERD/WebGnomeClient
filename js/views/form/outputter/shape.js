define([
    'jquery',
    'underscore',
    'backbone',
    'moment-timezone',
    'tzlookup',
    'module',
    'views/form/outputter/base',
    'model/outputters/shape'
], function($, _, Backbone, moment, tzlookup, module, OutputFormBase, ShapeOutputModel){
    'use strict';
    var shapeFileOutputForm = OutputFormBase.extend({
        title: 'Shapefile Output',

        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new ShapeOutputModel(options);
            }
            this.model = model;
            var timeoffset = webgnome.model.get('timezone_offset').get('offset');

            if (!_.isNull(timeoffset)) {
                this.model.set('timeoffset', parseFloat(timeoffset));
            } else {
                this.model.set('timeoffset', null);
            }
            

           
            OutputFormBase.prototype.initialize.call(this, options, model);
        },

        update: function(e) {
            // Handle updates if not a string based input.  In those cases, we look for blur below
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();
          
            OutputFormBase.prototype.update.call(this, e);
        },

        save: function(options) {
            if (webgnome.model.get('uncertain') === true) {
                this.model.set('zip_output', true);
            }
            OutputFormBase.prototype.save.call(this, options);
        },
        
    });

    return shapeFileOutputForm;
});
