define([
    'jquery',
    'underscore',
    'backbone',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water',
    'model/location'
], function($, _, Backbone, GnomeModel, WindModel, WaterModel, GnomeLocation){
        var specialTests = {
            run: function(){
                QUnit.module('Special');
                this.test();
            },

            test: function(){
                asyncTest('Duplicate Wave Test', function(){
                    var gm = new GnomeModel();
                    var wind = new WindModel();
                    var water = new WaterModel();
                    gm.get('environment').add([wind, water]);
                    gm.save().always(function(){
                        gm.updateWaves();
                        var environment = gm.get('environment');
                        var waves = environment.findWhere({obj_type: 'gnome.environment.waves.Waves'});
                        equal(environment.length, 3, 'Correct number of environment object exist');
                        equal(environment.where({obj_type: wind.get('obj_type')}).length, 1, 'Only one wind exists');
                        equal(environment.where({obj_type: water.get('obj_type')}).length, 1, 'Only one water exists');
                        equal(environment.where({obj_type: waves.get('obj_type')}).length, 1, 'Only one waves exists');
                        gm.resetLocation();
                        var loc = new GnomeLocation({id: 'casco-bay'});
                        loc.fetch().always(function(){
                            gm.fetch().always(function(){
                                equal(environment.where({obj_type: wind.get('obj_type')}).length, 1, 'Only one wind exists');
                                equal(environment.where({obj_type: water.get('obj_type')}).length, 1, 'Only one water exists');
                                equal(environment.where({obj_type: waves.get('obj_type')}).length, 1, 'Only one waves exists');
                                start();
                            });
                        });
                    });
                });
            }
        };
    return specialTests;
});
