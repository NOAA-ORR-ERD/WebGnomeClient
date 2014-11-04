define([
    'underscore',
    'backbone',
    'model/base',
], function(_, Backbone, BaseModel){
    var risk = BaseModel.extend({
        urlRoot: '/environment/',

        defaults: {
            'obj_type': 'gnome.environment.resources.Risk',
            'area': 0,
            'diameter': 0,
            'distance': 0,
            'depth': 0,
            duration: {
                'hours': 0,
                'days': 0
            },

            efficiency: {
                'skimming': 50,
                'dispersant': 50,
                'insitu_burn': 50
            },
            'surface': .33,
            'column': .33,
            'shoreline': .34,
            units: {
                'area': 'sq. km',
                'diameter': 'km',
                'distance': 'km',
                'depth': 'm'
            }
        },

        validate: function(attrs, options){
            if (attrs.area < 1 || attrs.area === ''){
                return 'Water area must be greater than zero!';
            }
            if (attrs.diameter < 1 || attrs.diameter === ''){
                return 'Water diameter must be greater than zero!';
            }
            if (attrs.distance < 1 || attrs.distance === ''){
                return 'Distance from shore must be greater than zero!';
            }
            if (attrs.depth < 1 || attrs.depth === ''){
                return 'Average water depth must be greater than zero!';
            }
            if ((attrs.duration.days*24 + attrs.duration.hours) <= 0){
                return 'Duration time must be greater than zero!';
            }
        }

    });

    return risk;
    
});
