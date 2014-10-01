define([
    'jquery',
    'underscore',
    'backbone',
    'model/environment/water'
], function($, _, Backbone, WaterModel){
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
                        start();
                    },
                    error: function(){
                        ok(!_.isUndefined(water.get('id')), 'water has an id');
                        start();
                    }

                });
            });
        }
    };

    return environmentTests;
});