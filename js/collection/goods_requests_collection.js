define([
    'underscore',
    'backbone',
    'model/resources/goods_request'
], function(_, Backbone, GoodsRequest){
    'use strict';
    var goodsRequests = Backbone.Collection.extend({
        model: GoodsRequest,
        url: '/goods_requests',

        fetchAllRequests: function(type, retry){
            if (!this._requestPromise || retry) {
                this.requested = false;
                this._requestPromise =  new Promise(_.bind(function(resolve, reject) {
                    this.fetch(
                        {data: {'type': JSON.stringify(type)},
                         success: _.bind(function(model, resp, options){
                             this.requested = true;
                             resolve(model);
                            },this),
                         error: reject
                        }
                    );
                }, this));
                return this._requestPromise;
            } else {
                return this._requestPromise;
            }
        },

        getRequests: function(type, retry){
            return this.fetchAllRequests(undefined, retry).then(_.bind(function(coll){
                return coll.filter(function(m){return m.get('request_type').includes(type);});
            }, this));
        }
    });

    return goodsRequests;
});