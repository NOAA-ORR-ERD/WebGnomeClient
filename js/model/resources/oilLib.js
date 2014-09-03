define([
    'underscore',
    'jquery',
    'backbone',
    'fuse'
], function(_, $, Backbone, Fuse){
    var oilLib = Backbone.Collection.extend({

        ready: false,
        loaded: false,

        initialize: function(){
            if(!this.loaded){
                this.fetch({
                    success: _.bind(this.setReady, this)
                });
            this.loaded = true;
            }
        },

        url: function(){
            return 'http://0.0.0.0:9898/oil';
        },

        sortAttr: 'adios_oil_id',
        sortDir: 1,

        fetchOil: function(id, cb){
            var oil = Backbone.Model.extend({
                urlRoot: this.url
            });
            oil = new oil({id: id});
            oil.fetch({
                success: cb
            });
        },

        bySearch: function(obj){
            this.models = this.originalModels;
            var categoryCollection = this;
            var apiCollection = this.filterCollection(obj.api, {type: 'api'});
            if (obj.text.length > 1){
                var options = {keys: ['attributes.name',
                                      'attributes.field_name',
                                      'attributes.location',
                                      'attributes.adios_oil_id'
                                     ],
                               threshold: 0.1
                               };
                var f = new Fuse(this.models, options);
                var result = f.search(obj.text);
                this.models = result;
            }
            if (obj.category.child !== '' && obj.category.child !== 'All'){
                categoryCollection = this.filterCollection(obj.category, {type: 'categories'});
            }
            this.models = _.intersection(this.models, apiCollection.models, categoryCollection.models);
            this.length = this.models.length;
            this.ready = true;
            return this;
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
            this.originalModels = this.models;
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