define([
    'underscore',
    'backbone',
    'moment',
    'model/base'
], function(_, Backbone, moment, BaseModel){
    'use strict';
	var baseWeathererModel = BaseModel.extend({
		urlRoot: '/weatherer/',

        defaults: {
            'obj_type': 'gnome.weatherers.Weathering'
        },

        cleanupMap: {
            'Skimmer': 'skimmed',
            'Burn': 'burned',
            'ChemicalDispersion': 'chem_dispersed'
        },

		initialize: function() {
            if (this.get('obj_type').indexOf('cleanup') !== -1) {
                var start_time = '';

                if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)) {
                    start_time = moment(webgnome.model.get('start_time'));
                }
                else {
                    start_time = moment();
                }

                if (_.isUndefined(this.get('active_start'))) {
                    this.set('active_start', start_time.format('YYYY-MM-DDTHH:00:00'));
                }
                
                var end_time = '';

                if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)) {
                    end_time = start_time.add(webgnome.model.get('duration'), 's');
                }
                else {
                    end_time = start_time.add(1, 'day');
                }
                
                if (_.isUndefined(this.get('active_stop'))) {
                    this.set('active_stop', end_time.format('YYYY-MM-DDTHH:00:00'));
                }
            }

            BaseModel.prototype.initialize.call(this);
		},

        cascadeEfficiencies: function(eff){
            var weathererType = this.get('obj_type');
            var relevantColl = webgnome.model.get('weatherers').where({'obj_type': weathererType});

            _.each(relevantColl, function(el, inx, list) {
                el.set('efficiency', eff);
            });
        },

        getMaxCleanup: function() {
            var type = this.parseObjType();
            var key = this.cleanupMap[type];
            var balance = webgnome.mass_balance;

            var cleanup = _.filter(balance, function(el) {
                return el.name === key;
            });
 
            var current_amount = cleanup[0].nominal[parseInt(webgnome.model.get('num_time_steps'), 10) - 1][1];
            var eff = (this.get('efficiency') !== 0) ? this.get('efficiency') : 1;

            return current_amount / eff;
        },

        activeTimeRange: function() {
            return [this.parseTimeAttr(this.get('active_start')),
                    this.parseTimeAttr(this.get('active_stop'))];
        },

        dataActiveTimeRange: function() {
            if (this.attributes.hasOwnProperty('wind')) {
                var wind = this.get('wind');

                if (wind.attributes.extrapolation_is_allowed) {
                    return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
                }
                else {
                    // return the min and max time values in our timeseries
                    var timeRange = wind.attributes.timeseries.map(function(dateVal) {
                        return this.parseTimeAttr(dateVal[0]);
                    }, this);

                    return [_.min(timeRange), _.max(timeRange)];
                }
            }
            else if (this.attributes.hasOwnProperty('timeseries')) {
                // timeseries is implemented primarily for ROC.  It is a list
                // of time ranges corresponding to individual (atomic) cleanup
                // operations that are projected to have happened during the
                // model run.  So for all of these time ranges, we basically
                // want the minimum and maximum time.
                var timeseries = this.get('timeseries');

                var flatTimes = [].concat.apply([], timeseries).map(function(dateVal) {
                    return this.parseTimeAttr(dateVal);
                }, this);

                return [_.min(flatTimes), _.max(flatTimes)];
            }
            else {
                // if we don't have any wind or timeseries attribute,
                // then we will assume that we are dealing with a non-wind
                // weatherer that probably has a real_data_start/stop
                // attribute pair.
                //
                // TODO: FIXME: This is a really brittle way to determine
                //       whether a weatherer's data matches its active time
                //       range.  Bugs are just waiting to happen.
                return [this.parseTimeAttr(this.get('real_data_start')),
                        this.parseTimeAttr(this.get('real_data_stop'))];
            }
        },

        parseTimeAttr: function(timeAttr) {
            // timeAttr is a string value representing a date/time or a
            // positive or negative infinite value.
            if (timeAttr === 'inf') {
                return Number.POSITIVE_INFINITY;
            }
            else if (timeAttr === '-inf') {
                return Number.NEGATIVE_INFINITY;
            }
            else {
                return moment(timeAttr.replace('T',' ')).unix();
            }
        },
	});

	return baseWeathererModel;

});