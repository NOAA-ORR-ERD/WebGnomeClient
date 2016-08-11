define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
], function($, _, Backbone, module, OutputModal){
    'use strict';
    var netCDFOutputForm = OutputModal.extend({
        title: 'NetCDF Output'
    });

    return netCDFOutputForm;
});