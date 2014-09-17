define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    var oilDistinct = Backbone.Collection.extend({
        initialize: function(cb){
            this.fetch({
                success: cb
            });
        },
        
        url: function(){
            return webgnome.config.oil_api + '/distinct';
        }
    });

    return oilDistinct;
});