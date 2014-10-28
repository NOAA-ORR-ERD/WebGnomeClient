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
            time: {
                'hours': 0,
                'days': 0
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
            if (attrs.area < 0 || attrs.area === ''){
                return 'Water area must be greater than or equal to zero!';
            }
            if (attrs.diameter < 0 || attrs.diameter === ''){
                return 'Water diameter must be greater than or equal to zero!';
            }
            if (attrs.distance < 0 || attrs.distance === ''){
                return 'Distance from shore must be greater than or equal to zero!';
            }
            if (attrs.depth < 0 || attrs.depth === ''){
                return 'Average water depth must be greater than or equal to zero!';
            }
            if ((attrs.time.days*24 + attrs.time.hours) <= 0){
                return 'Risk assessment time must be greater than zero!';
            }
            if (attrs.surface < 0 || attrs.surface > 1){
                return 'Water surface valuation must be a percentage!';
            }
            if (attrs.column < 0 || attrs.column > 1){
                return 'Water column valuation must be a percentage!';
            }
            if (attrs.shoreline < 0 || attrs.shoreline > 1){
                return 'Shoreline valuation must be a percentage!';
            }
        }

    });

    return risk;
    
});
