define([
    'underscore',
    'backbone',
    'model/spill'
], function(_, Backbone, GnomeSpill){
    'use strict';
    var gnomeSpills = Backbone.Collection.extend({
        model: GnomeSpill,
        complied: true,

        startTimeComplies: function(start_time) {
            this.each(_.bind(function(el, i, col){
                console.log(start_time, el.get('release').get('release_time'));
                if (start_time !== el.get('release').get('release_time')) {
                    this.complied = false;
                }
            }, this));

            return this.complied;
        }
    });

    return gnomeSpills;
});