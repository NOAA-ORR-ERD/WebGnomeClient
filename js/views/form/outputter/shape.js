define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
], function($, _, Backbone, module, OutputModal){
    'use strict';
    var shapeFileOutputForm = OutputModal.extend({
        title: 'Shapefile Output',

        save: function(options) {
            if (webgnome.model.get('uncertain') === true) {
                this.model.set('zip_output', true);
            }
            OutputModal.prototype.save.call(this, options);
        }
    });

    return shapeFileOutputForm;
});