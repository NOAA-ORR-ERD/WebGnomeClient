define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'moment',
    'localforage',
], function(_, $, Backbone, BaseModel, moment, localforage){
    'use strict';
    var baseTZOffsetObj = BaseModel.extend({
        defaults: {
            title: "No Timezone Specified",
            offset: null,
        }
    });
    return baseTZOffsetObj;
});
