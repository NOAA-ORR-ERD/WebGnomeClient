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
        },
        parse: function(response, options){
            // For the appearance, we want to try to merge in any defaults
            // that might exist that do not exist in the data we recieved.
            // This will help protect against getting an old .gnome based response
            // which might be missing needed data (i.e. new tracked attributes)
            function mergeMissingDefaults(original, defaults) {
                for (let key in defaults) {
                    if (defaults.hasOwnProperty(key) && !original.hasOwnProperty(key) &&
                        !(defaults[key] instanceof BaseModel)) {
                        // If there is a default that is not part of the original
                        // we make an attempt to copy it
                        if (defaults[key] instanceof Array) {
                            original[key] = [...defaults[key]];
                        } else if (defaults[key] instanceof Object) {
                            original[key] = Object.assign({}, defaults[key]);
                        } else {
                            original[key] = defaults[key];
                        }
                    } else if (defaults.hasOwnProperty(key)) {
                        // If we have a default, and it exists in the original
                        // we need to see if its an object... and if so we recurse,
                        // else we just move on.  We skip arrays and anything that
                        // is also a BaseModel (i.e. nested models already created
                        // like in the colormap case.
                        if (defaults[key] instanceof Object && !(defaults[key] instanceof Array) &&
                            !(defaults[key] instanceof BaseModel)) {
                            mergeMissingDefaults(original[key], defaults[key]);
                        }
                    }
                }
            }
            BaseModel.prototype.parse.call(this, response, options);
            var defaults = (typeof this.defaults === 'function') ? this.defaults() : this.defaults;
            // The merging happens in place (by reference) for the response.
            mergeMissingDefaults(response, defaults);
            return response;
        }
    });
    return appearanceModel;
});
