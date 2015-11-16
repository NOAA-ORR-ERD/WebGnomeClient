define([
    'backbone',
], function(Backbone){
    // model class that will receive a list of 4 lat lon points and requested source
    // currently only two sources are supported by goods for shoreline data
    // GSHHS (world) and NOS (Contiguous US)
    // based on the provided parameters this class will construct a request to the goods api
    var shorelinesResource = Backbone.Model.extend({

    });

    return shorelinesResource;
});