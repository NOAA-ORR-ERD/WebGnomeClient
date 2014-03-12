// basic controller to configure and setup the app
require([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'util',
    'rivets',
    'lib/jquery.imagesloaded.min',
], function($, _, Backbone, router, util, rivets) {
    "use strict";
    var initialize = function(){
        // Ask jQuery to add a cache-buster to AJAX requests, so that
        // IE's aggressive caching doesn't break everything.
        $.ajaxSetup({
            cache: false
        });

        // Configure a Rivets adapter to work with Backbone
        // per http://rivetsjs.com/
        rivets.configure({
            adapter: {
                subscribe: function(obj, keypath, callback) {
                    callback.wrapped = function(m, v) {
                        callback(v);
                    };
                    obj.on('change:' + keypath, callback.wrapped);
                },
                unsubscribe: function(obj, keypath, callback) {
                    obj.off('change:' + keypath, callback.wrapped);
                },
                read: function(obj, keypath) {
                    return obj.get(keypath);
                },
                /*
                 When setting a value, if it's parsable as a float, use a
                 float value instead. This is to support JSON Schema
                 validation of float types.
                 */
                publish: function(obj, keypath, value) {
                    var floatVal = parseFloat(value);
                    if (!isNaN(floatVal)) {
                        value = floatVal;
                    }
                    obj.set(keypath, value);
                }
            }
        });

        // Use Django-style templates semantics with Underscore's _.template.
        _.templateSettings = {
            // {{- variable_name }} -- Escapes unsafe output (e.g. user
            // input) for security.
            escape: /\{\{-(.+?)\}\}/g,

            // {{ variable_name }} -- Does not escape output.
            interpolate: /\{\{(.+?)\}\}/g
        };

        var appOptions = {
            el: $('#app'),
            modelId: "${model_id}",
            map: ${map_data | n},
            renderer: ${renderer_data | n},
            gnomeSettings: ${model_settings | n},
            generatedTimeSteps: ${generated_time_steps_json or '[]' | n},
            expectedTimeSteps: ${expected_time_steps_json or '[]' | n},
            currentTimeStep: ${current_time_step},
            surfaceReleaseSpills: ${surface_release_spills | n},
            windMovers: ${wind_movers | n},
            winds: ${winds | n},
            randomMovers: ${random_movers | n},
            mapIsLoaded: ${"true" if map_is_loaded else "false"},
            locationFilesMeta: ${location_file_json | n},
            animationThreshold: 25, // Milliseconds
            defaultSurfaceReleaseSpill: ${default_surface_release_spill | n},
            defaultWindMover: ${default_wind_mover | n},
            defaultWind: ${default_wind | n},
            defaultRandomMover: ${default_random_mover | n},
            defaultMap: ${default_map | n},
            defaultCustomMap: ${default_custom_map | n},
            jsonSchema: ${json_schema | n}
        };

        $('#map').imagesLoaded(function() {
            new router.Router({
                newModel: ${"true" if created else "false"},
                appOptions: appOptions
            });

            Backbone.history.start();
        });
    }
});