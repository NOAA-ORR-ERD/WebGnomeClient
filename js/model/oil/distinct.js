define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone){
    'use strict';
    var oilDistinct = Backbone.Collection.extend({
        initialize: function(cb){
            this.fetch({
                success: cb
            });
        },
        
        url: function(){
            return webgnome.config.oil_api + '/distinct';
        },

        sync: function(method, model, options){
            var oilDistinct = localStorage.getItem('oil_distinct');
            if (!_.isNull(oilDistinct)){
                oilDistinct = JSON.parse(oilDistinct);
                var ts = oilDistinct['ts'];
                var now = moment().unix();
                if (now - ts < 86400){
                    var data = oilDistinct['distinct'];
                    options.success(data, 'success', null);
                } else {
                    var success = options.success;
                    options.success = function(resp, status, xhr){
                        oilDistinct['distinct'] = resp;
                        oilDistinct['ts'] = now;
                        localStorage.setItem('oil_distinct', JSON.stringify(oilDistinct));
                        success(resp, status, xhr);
                    }
                    Backbone.sync(method, model, options);
                }
            } else {
                var success = options.success;
                options.success = function(resp, status, xhr){
                    var now = moment().unix();
                    var oilDistinct = {};
                    oilDistinct['distinct'] = resp;
                    oilDistinct['ts'] = now;
                    localStorage.setItem('oil_distinct', JSON.stringify(oilDistinct));
                    success(resp, status, xhr);
                }
                Backbone.sync(method, model, options);
            }
        }
    });

    return oilDistinct;
});