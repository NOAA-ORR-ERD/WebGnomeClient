define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var fayGravityViscous = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.FayGravityViscous',
        },

        toTree: function(){
            return '';
        }
    });

    return fayGravityViscous;
});