define([
    'underscore',
    'backbone',
    'moment',
    'model/weatherers/base'
], function(_, Backbone, moment, BaseModel){
	beachingWeatherer = BaseModel.extend({
		defaults: {
			'obj_type': 'gnome.weatherers.manual_beaching.Beaching',
			'active_start': '2014-07-07T12:00:00',
			'name': 'Beaching',
			'units': 'bbl',
			'timeseries': [['2014-07-07T12:00:00', [0]]]
		},

		toTree: function(){
			return '';
		},

		validate: function(attrs, options){

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