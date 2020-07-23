define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/binary'
], function($, _, Backbone, module, OutputFormBase, BinaryOutputModel){
    'use strict';
    var binaryOutputForm = OutputFormBase.extend({
        title: 'Binary Output',

        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new BinaryOutputModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
        },

        save: function(options) {
            this.model.set('zip_output', true);
            OutputFormBase.prototype.save.call(this, options);
        }
    });

    return binaryOutputForm;
});