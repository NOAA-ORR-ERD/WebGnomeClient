define([
    'underscore',
    'backbone',
    'moment',
    'model/base'
], function(_, Backbone, moment, BaseModel){
    var windModel = BaseModel.extend({
        urlRoot: '/environment/',

        defaults: {
            timeseries: []
        },

        sortTimeseries: function(){
            var ts = _.sortBy(this.get('timeseries'), function(entry){
                return moment(entry[0]).unix();
            });
            this.set('timeseries', ts);
        }
    });

    return windModel;
});