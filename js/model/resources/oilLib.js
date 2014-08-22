define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    var oilLib = Backbone.Collection.extend({

        ready: false,

        initialize: function(obj){
            this.fetch({
                success: _.bind(this.setReady, this)
            });
            this.filter = obj;
        },
        url: function(){
            return 'http://0.0.0.0:9898/oil';
        },

        sortAttr: 'name',
        sortDir: 1,

        comparator: function(a, b){
            var a = a.get(this.sortAttr),
                b = b.get(this.sortAttr);

            if (a == b) return 0;

            if (this.sortDir == 1) {
                return a > b ? 1 : -1;
            } else {
                return a < b ? 1 : -1;
            }
        },

        setReady: function(){
            this.ready = true;
            this.trigger('ready');
        },

        fetch: function(options){
        
            if(_.isUndefined(options)){
                options = {};
            }
            if(!_.has(options, 'data')){
                options.data = {};
            }
            Backbone.Collection.prototype.fetch.call(this, options);
        },

        sortOils: function(attr){
            this.sortAttr = attr;
            this.sort();
        }

    });

    return oilLib;
});