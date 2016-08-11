define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
], function($, _, Backbone, module, OutputModal){
    'use strict';
    var kmzOutputForm = OutputModal.extend({
        title: 'KMZ Output'
    });

    return kmzOutputForm;
});