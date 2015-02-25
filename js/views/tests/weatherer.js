define([
    'jquery',
    'underscore',
    'backbone',
    'model/gnome',
    'model/weatherers/evaporation',
    'model/weatherers/emulsification',
    'model/weatherers/dispersion'
], function($, _, Backbone, GnomeModel, EvaporationModel, EmulsificationModel, DispersionModel){
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

            asyncTest('Test weatherer on persistance', function(){
                var gmodel = new GnomeModel();
                gmodel.save().always(function(){
                    equal(gmodel.get('weatherers').length, 3, 'expected number of weatherers exist');

                    gmodel.get('weatherers').forEach(function(weatherer){
                        weatherer.set('on', false);
                    });
                    gmodel.save().always(function(){
                        gmodel.get('weatherers').forEach(function(weatherer){
                            notEqual(weatherer.get('on'), true, weatherer.get('name') + ' is off');
                            weatherer.set('on', true);
                        });
                        gmodel.save().always(function(){
                            gmodel.get('weatherers').forEach(function(weatherer){
                                equal(weatherer.get('on'), true, weatherer.get('name') + ' is on');
                            });
                            start();
                        });
                    });
                });
            });
        }
    };

    return weathererTests;
});