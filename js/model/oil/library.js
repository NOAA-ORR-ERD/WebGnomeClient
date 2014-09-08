define([
    'underscore',
    'jquery',
    'backbone',
    'fuse'
], function(_, $, Backbone, Fuse){
    var oilLib = Backbone.Collection.extend({

        ready: false,
        loaded: false,
        sortAttr: 'name',
        sortDir: 1,

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

        fetchOil: function(id, cb){
            var oil = Backbone.Model.extend({
                urlRoot: this.url
            });
            oil = new oil({id: id});
            oil.fetch({
                success: cb
            });
        },

        filterCollection : function(arr, options){
            if (options.type === 'api' || options.type === 'viscosity'){
                var results = this.filter(function(model){
                    if (model.attributes[options.type] >= arr[0] && model.attributes[options.type] <= arr[1]){
                        return true;
                    } else {
                        return false;
                    }
                });
            } else if (options.type === 'pour_point'){
                var results = this.filter(function(model){
                    if (model.attributes[options.type][0] > arr[1] || model.attributes[options.type][1] < arr[0]){
                        return false;
                    } else {
                        return true;
                    }
                });
            } else if (options.type === 'categories'){
                var str = arr.parent + '-' + arr.child;
                var results = this.filter(function(model){
                    return _.indexOf(model.attributes.categories, str) !== -1;
                });
            }
            return new Backbone.Collection(results);
        },

        search: function(obj){
            this.models = this.originalModels;
            var categoryCollection = this;
            var apiCollection = this.filterCollection(obj.api, {type: 'api'});
            var viscosityCollection = this.filterCollection(obj.viscosity, {type: 'viscosity'});
            var pour_pointCollection = this.filterCollection(obj.pour_point, {type: 'pour_point'});
            if (obj.text.length > 1){
                var options = {keys: ['attributes.name',
                                      'attributes.field_name',
                                      'attributes.location'
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
            this.models = _.intersection(this.models, pour_pointCollection.models, apiCollection.models, viscosityCollection.models, categoryCollection.models);
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