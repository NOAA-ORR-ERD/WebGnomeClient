define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/map',
    'text!templates/location/index.html'
], function($, _, Backbone, olMapView, LocationsTemplate){
    var locationsView = Backbone.View.extend({
        className: 'container page locations',
        map: null,

        initialize: function(){
            this.map = new olMapView({});
            this.render();
            webgnome.map = this.map;
        },

        render: function(){
            compiled = _.template(LocationsTemplate);
            $('body').append(this.$el.html(compiled));
            this.map.render();
        }
    });

    return locationsView;
});