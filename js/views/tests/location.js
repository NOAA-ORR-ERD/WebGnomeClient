define([
    'jquery',
    'underscore',
    'backbone',
    'model/location',
    'model/gnome'
], function($, _, Backbone, LocationModel, GnomeModel){
    var locationTests = {
        locId: 0,
        run: function(){
            QUnit.module('Locations');
            var jqxhr = $.get(webgnome.config.api + '/location', _.bind(function(json){
                this.locations = json;
                this.test();
            }, this));
        },

        test: function(){
            asyncTest('Get a GeoJSON list of all the posible locations', _.bind(function(){
                ok(!_.isUndefined(this.locations), 'A response was recieved');
                equal(this.locations.type, 'FeatureCollection', 'json response is geojson');
                ok(this.locations.features.length > 0, 'there are locations in the geojson');
                start();
            }, this));

            for(var loc in this.locations.features){
                asyncTest('Test location file ' + this.locations.features[loc].properties.title, _.bind(this.locationTest, this));
            }
        },

        locationTest: function(){
            var location = this.locations.features[this.locId];
            ok(location.geometry.coordinates.length == 2, 'Location has a lat long position');
            ok(_.has(location.properties, 'title'), 'Location has title');
            ok(_.has(location.properties, 'slug'), 'Location has slug');
            
            location = new LocationModel({id: location.properties.slug});
            location.fetch({
                success: function(){
                    ok(location.get('name') !== '', 'location has a name');
                    ok(location.get('steps').length > 0, 'location wizard has steps');

                    var model = new GnomeModel();
                    model.fetch({
                        success: function(){
                            ok(!_.isUndefined(model.get('map')), 'model has a map loaded');
                            ok(model.toTree().length > 0, 'model to tree works');
                            start();
                        },
                        error: function(){
                            ok(!_.isUndefined(model.get('map')), 'model has a map loaded');
                            ok(model.toTree().length > 0, 'model to tree works');
                            start();
                        }
                    });

                },
                error: function(){
                    ok(location.get('name') !== '', 'location has a name');
                    ok(location.get('steps').length > 0, 'location wizard has steps');
                    start();
                }
            });
            this.locId++;

        }
    };

    return locationTests;
});