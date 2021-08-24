define([
    'underscore',
    'backbone',
    'moment',
    'model/weatherers/base',
	'model/environment/water'
], function(_, Backbone, moment, BaseModel, WaterModel) {
    'use strict';
	var beachingWeatherer = BaseModel.extend({
		defaults: {
			'obj_type': 'gnome.weatherers.manual_beaching.Beaching',
			'units': 'bbl',
			'timeseries': [],
			'active_range': ['2014-07-07T12:00:00', 'inf'],  // TODO: why that date?
            'water': undefined
		},

        model: {
            water: {'gnome.environment.water.Water': WaterModel}
        },

		initialize: function() {
			BaseModel.prototype.initialize.call(this);

			if (!_.isUndefined(webgnome.model)) {
				this.set('active_range',
				         [webgnome.model.get('start_time'), 'inf']);
			}
		},

		toTree: function() {
			return '';
		},

		displayTimeseries: function() {
			var events = [];
			var ts = this.get('timeseries');

			for (var i = 0; i < ts.length; i++) {
				var time_str = moment(ts[i][0]).format(webgnome.config.date_format.moment);
				var amount = ts[i][1];

				events.push({'time': time_str, 'amount': amount});
			}

			return events;
		},

        validate: function(attrs, options) {
            var modelStartTime = moment(webgnome.model.get('start_time')).unix();

            if (!_.isUndefined(attrs.timeseries)) {
                var msg;

                _.each(attrs.timeseries, function(el, ind, arr) {
                    if (el[1] < 0){
                        msg = 'Amount spilled must be greater than or equal to 0';
                    }
                    var beachedStartTime = moment(el[0]).unix();

                    if (beachedStartTime <= modelStartTime){
                        msg = 'Beaching events must happen after the gnome model start time!';
                    }

				});

				if (msg) {
					return msg;
				}
			}

			if (_.isUndefined(attrs.units)) {
				return 'Amount spilled units must be defined!';
			}
		},

		sortTimeseries: function(){
			var ts = _.sortBy(this.get('timeseries'), function(entry){
				return moment(entry[0]).unix();
			});
			this.set('timeseries', ts);
		}
	});

	return beachingWeatherer;
});