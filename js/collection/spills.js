define([
    'underscore',
    'backbone',
    'model/spill/spill',
    'moment'
], function(_, Backbone, GnomeSpill, moment){
    'use strict';
    var gnomeSpills = Backbone.Collection.extend({
        model: GnomeSpill,
        complied: true,

        startTimeComplies: function(start_time) {
            this.complied = true;
            this.each(_.bind(function(el, i, col){
                if (start_time !== el.get('release').get('release_time')) {
                    this.complied = false;
                }
            }, this));

            return this.complied;
        },

        earliestSpillTime: function() {
            var early = this.at(0).get('release').get('release_time');
            this.each(_.bind(function(el, i, col) {
                if (moment(early).isAfter(el.get('release').get('release_time'))) {
                    early = el.get('release').get('release_time');
                }
            }, this));

            return early;
        }
    });

    return gnomeSpills;
});