define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    var gnomeLocation = BaseModel.extend({
        urlRoot: '/location/',

        defaults: {
            'id': '',
            'position': [0, 0],
            'steps': {},
        },
    });

    return gnomeLocation;
});