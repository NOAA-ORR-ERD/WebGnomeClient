define([
    'underscore',
    'jquery',
    'backbone'
], function(_, $, Backbone) {
    'use strict';
    var ndbcWind = Backbone.Model.extend({
        fetching: false,
        fetched: false,

        initialize: function(options) {
            Backbone.Model.prototype.initialize.call(this, options);
            this.on('sync error', this.resetFetch, this);
        },

        url: function() {
            return webgnome.config.api + '/goods/ndbc';
            //return webgnome.config.goods_api + '/winds/NWS_point/point_forecast?format=JSON';
        },

/*         validate: function(attrs, options) {
            if (_.isUndefined(attrs.buoy_id)) {
                return 'Station ID is required.';
            }
        }, */

        fetch: function(options) {
            if (this.isValid()) {
                if (_.isUndefined(options)) {
                    options = {};
                }

                if (!_.has(options, 'data')) {
                    options.data = {
                        'buoy_id': this.get('buoy_id'),
                        'days_ago': this.get('days_ago'),

                    };
                }
                else {
                    options.data.buoy_id = this.get('buoy_id');
                    options.data.days_ago = this.get('days_ago');
                }

                this.fetching = true;
                this.request = Backbone.Model.prototype.fetch.call(this, options);
            }
        },

        cancel: function() {
            if (this.fetching && this.request) {
                this.request.abort();
                this.resetFetch();
            }
        },

        resetFetch: function() {
            this.fetching = false;
        }
    });

    return ndbcWind;
});
