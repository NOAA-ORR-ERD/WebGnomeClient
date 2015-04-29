define([
    'underscore',
    'backbone',
    'moment',
    'model/weatherers/base'
], function(_, Backbone, moment, BaseModel){
	beachingWeatherer = BaseModel.extend({
		defaults: {
			'obj_type': 'gnome.weatherers.manual_beaching.Beaching',
			'name': 'Beaching',
			'units': 'bbl',
			'timeseries': [['2014-07-07T12:00:00', [0]]]
		},

		toTree: function(){
			return '';
		},

		initialize: function(){
			BaseModel.prototype.initialize.call(this);
			if (this.get('timeseries')[0][0] === '2014-07-07T12:00:00'){
				var ts = [[this.get('active_start'), [0]]];
				this.set('timeseries', ts);
			}
		},

		validate: function(attrs, options){
			var modelStartTime = moment(webgnome.model.get('start_time')).unix();
			if(!_.isUndefined(attrs.timeseries)){
				var msg;
				_.each(attrs.timeseries, function(el, ind, arr){
					if (el[1][0] < 0){
						msg = 'Amount spilled must be greater than or equal to 0';
					}
					var beachedStartTime = moment(el[0]).unix();

					if (beachedStartTime < modelStartTime){
						msg = 'Beaching events must happen after the gnome model start time!';
					}

				});
				if (msg){
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