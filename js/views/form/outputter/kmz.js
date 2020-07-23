define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/kmz'
], function($, _, Backbone, module, OutputFormBase, KMZModel){
    'use strict';
    var kmzOutputForm = OutputFormBase.extend({
        title: 'KMZ Output',

        initialize: function(options, model) {
            if (_.isUndefined(model)) {
                model = new KMZModel(options);
            }
            this.model = model;
            OutputFormBase.prototype.initialize.call(this, options, model);
        }
    });

    return kmzOutputForm;
});