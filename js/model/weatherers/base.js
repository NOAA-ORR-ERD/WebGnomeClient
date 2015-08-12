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

		initialize: function(){
            if (this.get('obj_type').indexOf('cleanup') !== -1){
                var start_time = '';
                if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)){
                    start_time = moment(webgnome.model.get('start_time'));
                } else {
                    start_time = moment();
                }

                if(_.isUndefined(this.get('active_start'))){
                    this.set('active_start', start_time.format('YYYY-MM-DDTHH:00:00'));
                }
                var end_time = '';
                if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)){
                    end_time = start_time.add(webgnome.model.get('duration'), 's');
                } else {
                    end_time = start_time.add(1, 'day');
                }
                
                if(_.isUndefined(this.get('active_stop'))){
                    this.set('active_stop', end_time.format('YYYY-MM-DDTHH:00:00'));
                }
            }
            BaseModel.prototype.initialize.call(this);
		},

        parseObjType: function(){
            return this.get('obj_type').split('.').pop();
        },

        cascadeEfficiencies: function(eff){
            var weathererType = this.get('obj_type');
            var relevantColl = webgnome.model.get('weatherers').where({'obj_type': weathererType});
            _.each(relevantColl, function(el, inx, list){
                el.set('efficiency', eff);
            });
            webgnome.model.save();
        }
	});

	return baseWeathererModel;

});