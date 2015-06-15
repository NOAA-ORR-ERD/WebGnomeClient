define([
    'underscore',
    'backbone',
    'model/spill'
], function(_, Backbone, GnomeSpill){
    'use strict';
    var gnomeSpills = Backbone.Collection.extend({
        model: GnomeSpill
    });

    return gnomeSpills;
});