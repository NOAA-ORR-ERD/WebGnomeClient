define([
    'underscore',
    'backbone',
    'model/weatherers/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var langmuir = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.Langmuir',
        },

        toTree: function(){
            return '';
        }
    });

    return langmuir;
});