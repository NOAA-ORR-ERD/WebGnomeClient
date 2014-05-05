define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'views/default/map',
    'lib/text!templates/form/spill-map.html',
    'lib/text!templates/form/spill-form.html',
], function($, _, Backbone, FormModal, olMapView, MapTemplate, SpillTemplate) {
    var spillForm = FormModal.extend({
        className: 'modal fade form-modal spill-form',
        name: 'spill',
        title: 'Spill',
        map: new olMapView(),
        
        initialize: function(options, GnomeSpills, GnomeMap) {
            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(MapTemplate);
            this.GnomeSpills = GnomeSpills;
            this.GnomeMap = GnomeMap;

            this.render();
        },

        ready: function() {
            this.map.render();
        }
    });

    return spillForm;
});