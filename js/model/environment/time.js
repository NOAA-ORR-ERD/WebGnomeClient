define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'moment',
    'localforage',
], function(_, $, Backbone, BaseModel, moment, localforage){
    'use strict';
    var baseTimeObj = BaseModel.extend({
        urlRoot: '/time/',
    });
    return baseTimeObj;
});
