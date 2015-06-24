define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    'use strict';
    var nwsWind = Backbone.Model.extend({
        url: function(){
            // http://gnome.orr.noaa.gov/goods/winds/NWS_point/point_forecast?latitude=47&longitude=-125.5&format=JSON
            return 'http://gnome.orr.noaa.gov/goods/winds/NWS_point/point_forecast?format=JSON';
        },

        validate: function(attrs, options){
            if(_.isUndefined(attrs.lat) || _.isUndefined(attrs.lon)){
                return 'Latitude and Longitude are both required.';
            }
        },

        fetch: function(options){
            if(this.isValid()){
                if(_.isUndefined(options)){
                    options = {};
                }
                if(!_.has(options, 'data')){
                    options.data = {
                        'latitude': this.get('lat'),
                        'longitude': this.get('lon')
                    };
                } else {
                    options.data.latitude = this.get('lat');
                    options.data.longitude = this.get('lon');
                }
                    
                Backbone.Model.prototype.fetch.call(this, options);
            }
        },
    });

    return nwsWind;
});