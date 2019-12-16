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
/*
        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
            if(options && options.default) {
                this.set(options.default, {silent:true});
                this.default = options.default;
            } else {
                this.default = {};
            }
            // if specified, it will fetch previously saved from cache. 
            if(options && options.cache) {
                this.fetch();
            }
            this.listenTo(this, 'change', this.save);
            
        },
*/

        resetToDefault: function() {
            var id = this.id;
            this.clear();
            this.set(this.default,{silent: true});
            this.set({id:id},{silent: true});
            this.save();
        }

    });
    return appearanceModel;
});
