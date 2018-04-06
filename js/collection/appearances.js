define([
    'underscore',
    'jquery',
    'backbone',
    'localforage',
    'model/visualization/appearance',
], function(_, $, Backbone, localforage, Appearance){
    'use strict';
    var appearanceCollection = Backbone.Collection.extend({
        appearances_cache : localforage.createInstance({name: 'Appearance Collection Data Cache'}),
        model: Appearance,

        initialize: function(attrs, options) {
            Backbone.Collection.prototype.initialize.call(this, attrs, options);
            if(options && options.id) {
                this.id = options.id;
            }
            this.listenTo(this, 'change', this.save);
        },

        fetch: function(options) {
            return new Promise(_.bind(function(resolve, reject) {
                this.appearances_cache.getItem(this.id + '_appearances').then(
                    _.bind(function(attrs) {
                        if (attrs) {
                            this.set(attrs, {silent: true});
                            resolve(attrs);
                        } else {
                            resolve(attrs);
                        }
                    }, this)
                );
            }, this ));
        },

        save: function(attrs, options) {
            if(this.id) {
                this.appearances_cache.setItem(this.id + '_appearances', this.toJSON());
            }
        },

    });
    return appearanceCollection;
});
