define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/shape'
], function($, _, Backbone, module, OutputFormBase, ShapeOutputModel){
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

        save: function(options) {
            if (webgnome.model.get('uncertain') === true) {
                this.model.set('zip_output', true);
            }
            OutputFormBase.prototype.save.call(this, options);
        }
    });

    return shapeFileOutputForm;
});