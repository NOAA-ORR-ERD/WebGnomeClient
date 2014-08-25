define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    var oilLib = Backbone.Collection.extend({

        ready: false,
        loaded: false,

        initialize: function(obj){
            this.filterCollect = obj;
            if (!this.loaded){
                this.fetch({
                    success: _.bind(this.setReady, this)
                });
            }
            this.loaded = true;
        },
        
        url: function(){
            return 'http://0.0.0.0:9898/oil';
        },

        sortAttr: 'name',
        sortDir: 1,

        filterCollection: function(){
            this.whereCollection(this.filterCollect);
        },

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
            this.loaded = true;
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