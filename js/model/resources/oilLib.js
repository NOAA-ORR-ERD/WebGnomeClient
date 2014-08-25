define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
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

        sortAttr: 'name',
        sortDir: 1,


        bySearch: function(obj){
            var nameCollection = this.whereCollection({'name': obj.text});
            var fieldCollection = this.whereCollection({'field_name': obj.text});
            var locationCollection = this.whereCollection({'location': obj.text});
            var unionCollection = _.union(nameCollection.models, fieldCollection.models, locationCollection.models);
            this.ready = true;
            var answer = new this.constructor(unionCollection, {loaded: true});
            return answer;
        },

        fuzzyFilter: function(){

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