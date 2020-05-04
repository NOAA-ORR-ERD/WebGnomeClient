define([
    'underscore',
    'backbone',
    'model/outputters/file_outputter'
], function(_, Backbone, FileOutputterModel){
    'use strict';
    var binaryOutputter = FileOutputterModel.extend({
        urlRoot: '/outputter/',

        defaults: function() {
            return _.defaults({
                'obj_type': 'gnome.outputters.binary.BinaryOutput',
                'filename': 'Model.zip',
                'output_timestep': 3600,
                'zip_output': true,
                'name': 'BinaryOutput'
            }, FileOutputterModel.prototype.defaults);
        },

        toTree: function(){
            return '';
        }
    });

    return binaryOutputter;
});