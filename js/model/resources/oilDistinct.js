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
            return 'http://0.0.0.0:9898/distinct';
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

    return oilDistinct;
});