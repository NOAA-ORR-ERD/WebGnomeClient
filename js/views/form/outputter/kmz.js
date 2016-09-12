define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/outputter/base',
    'model/outputters/kmz'
], function($, _, Backbone, module, OutputModal, KMZModel){
    'use strict';
    var kmzOutputForm = OutputModal.extend({
        title: 'KMZ Output'
    });

    return kmzOutputForm;
});