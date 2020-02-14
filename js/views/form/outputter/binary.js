define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/binary'
], function($, _, Backbone, module, OutputModal){
    'use strict';
    var binaryOutputForm = OutputModal.extend({
        title: 'Binary Output',

        save: function(options) {
            this.model.set('zip_output', true);
            OutputModal.prototype.save.call(this, options);
        }
    });

    return binaryOutputForm;
});