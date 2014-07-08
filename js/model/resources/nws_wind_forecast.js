define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    var nwsWind = Backbone.Model.extend({
        url: function(){
            return 'http://forecast.weather.gov/MapClick.php';
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
                    options.data = {};
                }
                _.extend(options.data, {
                    'FcstType': 'digitalDWML',
                    'w3': 'sfcwind',
                    'w3u': '0', 
                    'lat': this.get('lat'),
                    'lon': this.get('lon')
                });
                Backbone.Model.prototype.fetch.call(this, options);
            }
        },

    });

    return nwsWind;
});