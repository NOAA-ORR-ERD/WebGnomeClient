define([
    'jquery',
    'underscore',
    'backbone',
    'model/weatherers/evaporation'
], function($, _, Backbone, EvaporationModel){
    var weathererTests = {
        run: function(){
            QUnit.module('Weatherers');
            this.test();
        },

        test: function(){
            asyncTest('Create an evaporation Weatherer', function(){
                weatherer = new EvaporationModel();
                weatherer.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(weatherer.get('id')), 'weatherer was created');
                        start();
                    },
                    error: function(){
                        ok(!_.isUndefined(weatherer.get('id')), 'weatherer was created');
                        start();
                    }
                });
            });
        }
    };

    return weathererTests;
});