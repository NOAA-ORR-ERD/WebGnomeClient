//A model that stores appearance settings for various objects.

define([
    'underscore',
    'jquery',
    'backbone',
    'localforage',
    'model/base'
], function(_, $, Backbone, localforage, BaseModel){
    'use strict';
    var appearanceModel = BaseModel.extend({
        urlRoot: '/appearance/',

        defaults: {
            on: false,
            ctrl_names: {title:'Object Appearance',
                         on: 'Show'},
            _type: 'appearance',
            obj_type: 'gnome.utilities.appearance.Appearance'
        }
    });
    return appearanceModel;
});
