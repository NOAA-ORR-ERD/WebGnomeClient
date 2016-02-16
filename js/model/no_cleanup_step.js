define([
    'underscore',
    'backbone',
    'model/step'
], function(_, Backbone, StepModel){
    'use strict';
    var gnomeStep = StepModel.extend({
        url: '/full_run_without_response'
    });
    return gnomeStep;
});