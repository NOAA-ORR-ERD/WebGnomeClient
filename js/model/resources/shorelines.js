define([
    'backbone',
], function(Backbone){
    // model class that will receive a list of 4 lat lon points and requested source
    // currently only two sources are supported by goods for shoreline data
    // GSHHS (world) and NOS (Contiguous US)
    // based on the provided parameters this class will construct a request to the goods api
    var shorelineResource = Backbone.Model.extend({
        defaults: {
            northlat: 0,
            southlat: 0,
            westlon: 0,
            eastlon: 0,
            source: 'GSHHS',
            resolution: 'f'
        },

        url: function(){
            return 'http://hazweb2.orr.noaa.gov:7447/goods/tools/' + this.get('source') +'/coast_extract?NorthLat=' + this.get('northlat') + '&SouthLat=' + this.get('southlat') + '&WestLon=' + this.get('westlon') + '&EastLon=' + this.get('eastlon') + '&resolution=' + this.get('resolution') + '&webGNOME';
        },
        
        validate: function(attrs, options) {
            if (attrs.northlat > 45)  {
                return 'Latitude and Longitude are both required.';
            }
        },

        parse: function(response){
            return {
                file: response
            };
        }
    });

    return shorelineResource;
});