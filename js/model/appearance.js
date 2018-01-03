//A model that stores appearance settings for various objects.

define([
    'underscore',
    'jquery',
    'backbone',
    'localforage',
], function(_, $, Backbone, localforage){
    'use strict';
    var appearanceModel = Backbone.Model.extend({
        appearance_cache : localforage.createInstance({name: 'Appearance Data Cache',
                                                    }),

        initialize: function(attrs, options) {
            Backbone.Model.prototype.initialize.call(this, attrs, options);
            this.appearance_cache.getItem(this.get('id') + '_appearance').then(_.bind(function(atts){this.set(atts,{silent:true});},this));
            this.listenTo(this, 'change', this.save);
        },

        save: function(attrs, options) {
            this.appearance_cache.setItem(this.get('id') + '_appearance', this.toJSON());
        },
    });
    return appearanceModel;
});
