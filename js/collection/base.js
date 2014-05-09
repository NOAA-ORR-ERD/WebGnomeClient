define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var baseCollection = Backbone.Collection.extend({
        initialize: function (objs, opts) {
            BaseCollection.__super__.initialize.apply(this, arguments);

            if (opts && opts.gnomeModel) {
                this.gnomeModel = opts.gnomeModel;
                prependWithGnomeUrl.call(this);
            }
        }
    });

    return baseCollection;
});