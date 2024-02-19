define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/erma_data_package'
], function($, _, Backbone, module, OutputFormBase, ERMADataPackageOutputModel){
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

        save: function(options) {
            OutputFormBase.prototype.save.call(this, options);
        }
    });

    return ermaDataPackageOutputForm;
});
