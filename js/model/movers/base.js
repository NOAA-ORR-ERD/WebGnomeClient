define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
], function(_, $, Backbone, BaseModel){
    'use strict';
    var baseMover = BaseModel.extend({
        urlRoot: '/mover/',
        requesting: false,
        requested: false,

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
            this.on('change', this.resetRequest, this);
        },

        resetRequest: function(){
            this.requested = false;
        },

        getGrid: function(callback){
            var url = this.urlRoot + this.id + '/grid';
            if(!this.requesting && !this.requested || this.requested && this.hasChanged()){
                this.requesting = true;
                $.get(url, null, _.bind(function(geo_json){
                    this.requesting = false;
                    this.requested = true;
                    this.geo_json = geo_json;
                    callback(geo_json);
                }, this));
            } else {
                callback(this.geo_json);
            }
        }
    });

    return baseMover;
});