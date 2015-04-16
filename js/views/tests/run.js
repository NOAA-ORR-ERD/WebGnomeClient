define([
    'jquery',
    'underscore',
    'backbone',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water',
    'model/environment/waves',
    'model/spill',
    'model/substance'
], function($, _, Backbone, GnomeModel, WindModel, WaterModel, WavesModel, SpillModel, SubstanceModel){
    var mapTests = {
        run: function(){
            QUnit.module('Automated Runs');
            this.test();
        },

        test: function(){

            asyncTest('Run a weathering model', function(){
                var model = new GnomeModel();
                model.set('time_step', 3600);
                model.set('uncertain', false);
                var wind = new WindModel({timeseries: [['2014-07-07T12:00:00', [15, 15]]]});
                var water = new WaterModel();
                var environment = model.get('environment');
                environment.add([wind, water]);

                model.save(null, {
                    validate: false
                }).always(function(){
                    water = environment.findWhere({obj_type: water.get('obj_type')});
                    wind = environment.findWhere({obj_type: wind.get('obj_type')});
                    var waves = new WavesModel({water: water, wind: wind});
                    waves.save().always(function(){
                        model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'}).set('wind', wind);
                        model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.evaporation.Evaporation'}).set('water', water);
                        model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.emulsification.Emulsification'}).set('waves', waves);
                        model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.natural_dispersion.NaturalDispersion'}).set('waves', waves);
                        environment.add(waves);

                        model.save().always(function(){
                            equal(model.get('environment').length, 3, 'Model has correct number of environment objects');
                            var spill = new SpillModel();
                            var substance = new SubstanceModel({adios_oil_id: 'AD01759'});
                            substance.fetch().always(function(){
                                spill.set('amount', 900);
                                spill.get('release').set({num_elements: null, num_per_timestep: 10});
                                spill.get('element_type').set('substance', substance);
                                spill.save(null, {validate: false}).always(function(){
                                    model.get('spills').add(spill);
                                    model.save(null, {
                                        validate: false
                                    }).always(function(){
                                        var prev_step;
                                        webgnome.cache.on('step:recieved', function(step){
                                            var fate = step.get('WeatheringOutput').nominal;
                                            
                                            if(prev_step){
                                                // test any step after the first against the previous one
                                                var prev_fate = prev_step.get('WeatheringOutput').nominal;
                                                ok(fate.amount_released >= prev_fate.amount_released, 'amount released did not reduce');
                                                ok(fate.evaporated >= prev_fate.evaporated, 'continued to evaporate');
                                                ok(fate.natural_dispersion >= prev_fate.natural_dispersion, 'continued to disperse');
                                            } else {
                                                // test the first step
                                                ok(_.has(fate, 'amount_released'), 'amount_released defined');
                                                ok(fate.amount_released > 0, 'something has been released');
                                                ok(_.has(fate, 'avg_density'), 'avg_density defined');
                                                ok(_.has(fate, 'avg_viscosity'), 'avg_viscosity defined');
                                                ok(_.has(fate, 'beached'), 'beached defined');
                                                ok(_.has(fate, 'natural_dispersion'), 'natural dispersion defined');
                                                ok(_.has(fate, 'evaporated'), 'evaporated defined');
                                                ok(_.has(fate, 'floating'), 'floating defined');
                                                equal(fate.floating, fate.amount_released, 'all les are floating');
                                                ok(_.has(fate, 'water_content'), 'water_content defined');
                                            }

                                            prev_step = step;
                                            webgnome.cache.step();
                                        });
                                        webgnome.cache.on('step:failed', function(){
                                            equal(model.get('num_time_steps') - 1, prev_step.get('WeatheringOutput').step_num, 'Model fully ran');
                                            start();
                                        });
                                        webgnome.cache.step();
                                    });
                                });    
                            });
                        });
                    });
                    
                });
            });
        }
    };

    return mapTests;
});