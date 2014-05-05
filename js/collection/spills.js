define([
    'underscore',
    'backbone',
    'model/spill'
], function(_, Backbone, GnomeSpill){
    var gnomeSpills = Backbone.Collection.extend({
        model: GnomeSpill
    });

    return gnomeSpills;
});