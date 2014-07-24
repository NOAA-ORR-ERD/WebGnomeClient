define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var tideModel = BaseModel.extend({
        urlRoot: '/environment/',
        defaults: {
        	obj_type: 'gnome.environment.Tide'
        }
    });

    return tideModel;
});