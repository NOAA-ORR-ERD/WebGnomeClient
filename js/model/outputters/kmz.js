define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var kmzOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.kmz.KMZOutput',
            'name': 'Model',
            'output_last_step': 'true',
            'output_zero_step': 'true',
            'filename': 'Model.kmz',
            'on': false,
            'output_timestep': 900
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            if (!_.isUndefined(webgnome.model) && !_.isNull(this.get('output_start_time'))) {
                var start_time = webgnome.model.get('start_time');
                this.set('output_start_time', start_time);
            }
        },

        toTree: function(){
            return '';
        }
    });

    return kmzOutputter;
});