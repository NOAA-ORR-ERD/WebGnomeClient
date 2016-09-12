define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
], function($, _, Backbone, module, OutputModal){
    'use strict';
    var shapeFileOutputForm = OutputModal.extend({
        title: 'Shapefile Output'
    });

    return shapeFileOutputForm;
});