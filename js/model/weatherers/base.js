define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
	baseResponseModel = BaseModel.extend({
		urlRoot: '/weatherer/',

		initialize: function(){
			var start_time = '';
            if (!_.isUndefined(webgnome.model)){
                start_time = moment(webgnome.model.get('start_time'));
            } else {
                start_time = moment();
            }

            if(_.isUndefined(this.get('active_start'))){
                this.set('active_start', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            }
            var end_time = '';
            if (!_.isUndefined(webgnome.model)){
                end_time = start_time.add(webgnome.model.get('duration'), 's');
            } else {
                end_time = moment();
            }
            
            if(_.isUndefined(this.get('active_stop'))){
                this.set('active_stop', end_time.format('YYYY-MM-DDTHH:mm:ss'));
            }
            BaseModel.prototype.initialize.call(this);
		},

        parseObjType: function(){
            return this.get('obj_type').split('.').pop();
        }

	});

	return baseResponseModel;

});