define([
    'jquery',
    'underscore',
    'backbone',
    'model/gnome',
    'model/weatherers/evaporation'
], function($, _, Backbone, GnomeModel, EvaporationModel){
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
                gmodel = new GnomeModel();
                gmodel.save(null, {
                    validate: false,
                    success: function(){
                        weatherer = new EvaporationModel();
                        weatherer.save(null, {
                            validate: false,
                            success: function(){
                                ok(!_.isUndefined(weatherer.get('id')), 'weatherer was created');
                                equal(weatherer.get('on'), true, 'weatherer is turned on');
                                weatherer.set('on', false);
                                weatherer.save(null, {
                                    success: function(){
                                        equal(weatherer.get('on'), false, 'weatherer is turned off');
                                        gmodel.save(null, {
                                            validate: false,
                                            success: function(){
                                                gmodel.get('weatherers').add(weatherer);
                                                equal(gmodel.get('weatherers').at(0).get('on'), false, 'weatherer is still turned off');
                                                gmodel.save(null, {
                                                    success: function(){
                                                        equal(gmodel.get('weatherers').at(0).get('on'), false, 'weatherer is still off after a model save');
                                                        start();
                                                    },
                                                    error: function(){
                                                        equal(gmodel.get('weatherers').at(0).get('on'), false, 'weatherer is still off after a model save');
                                                        start();
                                                    }
                                                });
                                            },
                                            error: function(){
                                                gmodel.get('weatherers').add(weatherer);
                                                equal(gmodel.get('weatherers').length, 1, 'weatherer is still turned off');
                                                start();
                                            }
                                        });
                                    },
                                    error: function(){
                                        equal(weatherer.get('on', false, 'weather is turned off'));
                                        start();
                                    }
                                });
                            },
                            error: function(){
                                ok(!_.isUndefined(weatherer.get('id')), 'weatherer was created');
                                start();
                            }
                        });
                    },
                    error: function(){
                        start();
                    }
                });

                
            });
        }
    };

    return weathererTests;
});