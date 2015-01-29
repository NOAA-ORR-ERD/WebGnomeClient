define([
    'jquery',
    'underscore',
    'backbone',
    'model/environment/water',
    'model/environment/wind',
    'model/environment/tide'
], function($, _, Backbone, WaterModel, WindModel, TideModel){
    var environmentTests = {
        run: function(){
            QUnit.module('Environment');
            this.test();
        },

        test: function(){
            asyncTest('Create a water object', function(){
                var water = new WaterModel();
                water.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(water.get('id')), 'water has an id');
                        ok(!_.isUndefined(water.toTree()), 'water too tree works!');
                        equal(water.convertToK(32), 273.15, 'Fahrenheit to Kelvin conversion works');
                        // water.get('units').set('temperature', 'C');
                        // equal(water.get('units').get('temperature'), 'C', 'Temperature unit changed successfully');
                        // equal(water.convertToK(0), 273.15, 'Celsius to Kelvin conversion works');
                        start();
                    },
                    error: function(){
                        ok(!_.isUndefined(water.get('id')), 'water has an id');
                        ok(!_.isUndefined(water.toTree()), 'water too tree works!');
                        equal(water.convertToK(32), 273.15, 'Fahrenheit to Kelvin conversion works');
                        // water.get('units').set('temperature', 'C');
                        // equal(water.get('units').get('temperature'), 'C', 'Temperature unit changed successfully');
                        // equal(water.convertToK(0), 273.15, 'Celsius to Kelvin conversion works');
                        start();
                    }

                });
            });

            asyncTest('Create a wind object', function(){
                var wind = new WindModel();
                wind.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(wind.get('id')), 'wind has an id');
                        ok(!_.isUndefined(wind.toTree()), 'wind to tree works!');
                        start();
                    },
                    error: function(){
                        ok(!_.isUndefined(wind.get('id')), 'wind has an id');
                        ok(!_.isUndefined(wind.toTree()), 'wind to tree works!');
                        start();
                    }
                });
            });

            // asyncTest('Create a tide object', function(){
            //     var tide = new TideModel();
            //     tide.save(null, {
            //         validate: false,
            //         success: function(){
            //             ok(!_.isUndefined(tide.get('id')), 'tide has an id');
            //             ok(!_.isUndefined(tide.toTree()), 'tide to tree works!');
            //             start();
            //         },
            //         error: function(){
            //             ok(!_.isUndefined(tide.get('id')), 'tide has an id');
            //             ok(!_.isUndefined(tide.toTree()), 'tide to tree works!');
            //             start();
            //         }
            //     });
            // });
        }
    };

    return environmentTests;
});