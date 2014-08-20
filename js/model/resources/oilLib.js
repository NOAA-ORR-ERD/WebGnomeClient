define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    var oilLib = Backbone.Collection.extend({
        initialize: function(cb){
            this.fetch({
                success: cb
            });
        },
        url: function(){
            return 'http://0.0.0.0:9898/oil';
        },

        fetch: function(options){
        
            if(_.isUndefined(options)){
                options = {};
            }
            if(!_.has(options, 'data')){
                options.data = {};
            }
            Backbone.Collection.prototype.fetch.call(this, options);
        }

    });

    return oilLib;
});