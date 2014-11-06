define([
    'underscore',
    'model/gnome',
    'model/spill',
    'model/environment/wind',
    'model/movers/wind'
], function(_, GnomeModel, GnomeSpill, GnomeWind, GnomeWindMover){
    var modelTests = {
        run: function(){
            QUnit.module('Model');
            this.test();
        },

        test: function(){

            asyncTest('Create a model from an empty payload', function(){
                model = new GnomeModel();
                model.save(null, {
                    validate: false,
                    success: function(){
                        ok(model.get('id') !== '', 'gnome model has an object id');
                        ok(model.toTree().length > 0, 'model to tree works');
                        start();
                    },
                    error: function(){
                        ok(model.get('id') !== '', 'gnome model has an object id');
                        ok(model.toTree().length > 0, 'model to tree works');
                        start();
                    }
                });
            });

            asyncTest('Create a model from a partial payload', function(){
                model = new GnomeModel();
                model.set('duration', 8000);
                model.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(model.get('id')), 'model was created');
                        ok(model.get('duration') == 8000, 'model has the correct duration');
                        ok(model.toTree().length > 0, 'model to tree works');
                        start();
                    },
                    error: function(){
                        ok(!_.isUndefined(model.get('id')), 'model was created');
                        ok(model.get('duration') == 8000, 'model has the correct duration');
                        ok(model.toTree().length > 0, 'model to tree works');
                        start();
                    }
                });
            });

            asyncTest('Adding and removing an instant release spill', function(){
                var gnomemodel = new GnomeModel();
                gnomemodel.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(gnomemodel.get('id')), 'model was created');
                        spill = new GnomeSpill();
                        spill.save(null, {
                            validate: false,
                            success: function(){
                                ok(spill.get('id') !== '', 'spill was created on the server');
                                gnomemodel.get('spills').add(spill);
                                gnomemodel.save(null, {
                                    success: function(){
                                        ok(gnomemodel.get('spills').length === 1, 'Spill was added to model');
                                        ok(model.toTree().length > 0, 'model to tree works');
                                        gnomemodel.get('spills').remove(spill.get('id'));
                                        gnomemodel.save(null, {
                                            success: function(){
                                                ok(gnomemodel.get('spills').length === 0, 'Spill was removed from the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            },
                                            error: function(){
                                                ok(gnomemodel.get('spills').length === 0, 'Spill was removed from the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            }
                                        });
                                    },
                                    error: function(model, response){
                                        ok(gnomemodel.get('spills').length === 1, 'Spill was added to model');
                                        ok(model.toTree().length > 0, 'model to tree works');
                                        start();
                                    }
                                });
                            },
                            error: function(model, response){
                                ok(spill.get('id') !== '', 'spill was created on the server');
                                start();
                            }
                        });
                    }
                });
            });

            asyncTest('Adding and removing a continuous spill', function(){
                var gnomemodel = new GnomeModel();
                gnomemodel.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(gnomemodel.get('id')), 'model was created');
                        spill = new GnomeSpill();
                        spill.set('amount', '200');
                        spill.set('units', 'cubic meters');
                        spill.get('release').set('release_time', '2014-09-24T08:00:00');
                        spill.get('release').set('end_release_time', '2014-09-24T14:00:00');
                        spill.save(null, {
                            validate: false,
                            success: function(){
                                ok(spill.get('id') !== '', 'spill was created on the server');
                                gnomemodel.get('spills').add(spill);
                                gnomemodel.save(null, {
                                    success: function(){
                                        ok(gnomemodel.get('spills').length === 1, 'Spill was added to model');
                                        ok(model.toTree().length > 0, 'model to tree works');
                                        gnomemodel.get('spills').remove(spill.get('id'));
                                        gnomemodel.save(null, {
                                            success: function(){
                                                ok(gnomemodel.get('spills').length === 0, 'Spill was removed from the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            },
                                            error: function(){
                                                ok(gnomemodel.get('spills').length === 0, 'Spill was removed from the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            }
                                        });
                                    },
                                    error: function(model, response){
                                        ok(gnomemodel.get('spills').length === 1, 'Spill was added to model');
                                        ok(model.toTree().length > 0, 'model to tree works');
                                        start();
                                    }
                                });
                            },
                            error: function(model, response){
                                ok(spill.get('id') !== '', 'spill was created on the server');
                                start();
                            }
                        });
                    }
                });
            });

            asyncTest('Adding and removing a nested environment object', function(){
                var gnomemodel = new GnomeModel();
                gnomemodel.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(gnomemodel.get('id')), 'model was created');
                        wind = new GnomeWind();
                        wind.save(null, {
                            validate: false,
                            success: function(){
                                ok(wind.get('id') !== '', 'Wind was created on the server');
                                gnomemodel.get('environment').add(wind);
                                gnomemodel.save(null, {
                                    success: function(){
                                        ok(gnomemodel.get('environment').length === 1, 'Wind was added to model');
                                        ok(model.toTree().length > 0, 'model to tree works');
                                        gnomemodel.get('environment').remove(wind.get('id'));
                                        gnomemodel.save(null, {
                                            success: function(){
                                                ok(gnomemodel.get('environment').length === 0, 'Wind was removed from the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            },
                                            error: function(){
                                                ok(gnomemodel.get('environment').length === 0, 'Wind was removed from the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            }
                                        });
                                    },
                                    error: function(model, response){
                                        ok(gnomemodel.get('environment').length === 1, 'Wind was added to model');
                                        ok(model.toTree().length > 0, 'model to tree works');
                                        start();
                                    }
                                });
                            },
                            error: function(model, response){
                                ok(wind.get('id') !== '', 'Wind was created on the server');
                                start();
                            }
                        });
                    }
                });
            });

            asyncTest('Adding and removing a nested nested mover object', function(){
                var gnomemodel = new GnomeModel();
                gnomemodel.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(gnomemodel.get('id')), 'model was created');
                        wind = new GnomeWind();
                        wind.save(null, {
                            validate: false,
                            success: function(){
                                ok(wind.get('id') !== '', 'Wind was created');
                                windmover = new GnomeWindMover();
                                windmover.set('wind', wind);
                                windmover.save(null, {
                                    validate: false,
                                    success: function(){
                                        ok(!_.isUndefined(windmover.get('id')), 'Wind mover was created');
                                        deepEqual(windmover.get('wind').attributes, wind.attributes, 'Wind mover references the correct wind');
                                        gnomemodel.get('environment').add(wind);
                                        gnomemodel.get('movers').add(windmover);
                                        gnomemodel.save(null, {
                                            validate: false,
                                            success: function(){
                                                equal(gnomemodel.get('movers').at(0).get('id'), windmover.get('id'), 'Wind mover was added to the model');
                                                equal(gnomemodel.get('environment').at(0).get('id'), wind.get('id'), 'Wind was added to the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                gnomemodel.get('movers').remove(windmover.get('id'));
                                                gnomemodel.save(null, {
                                                    validate: false,
                                                    success: function(){
                                                        equal(gnomemodel.get('movers').length, 0, 'Wind mover removed from model');
                                                        equal(gnomemodel.get('environment').at(0).get('id'), wind.get('id'), 'Wind is still refereced by the model');
                                                        ok(model.toTree().length > 0, 'model to tree works');
                                                        start();
                                                    },
                                                    error: function(){
                                                        equal(gnomemodel.get('movers').length, 0, 'Wind mover removed from model');
                                                        equal(gnomemodel.get('environment').at(0).get('id'), wind.get('id'), 'Wind is still refereced by the model');
                                                        ok(model.toTree().length > 0, 'model to tree works');
                                                        start();
                                                    }
                                                });
                                            },
                                            error: function(){
                                                equal(gnomemodel.get('movers').at(0).get('id'), windmover.get('id'), 'Wind mover was added to the model');
                                                equal(gnomemodel.get('environment').at(0).get('id'), wind.get('id'), 'Wind was added to the model');
                                                ok(model.toTree().length > 0, 'model to tree works');
                                                start();
                                            }
                                        });
                                    },
                                    error: function(){
                                        deepEqual(windmover.get('wind').attributes, wind.attributes, 'Wind mover references the correct wind.');
                                        start();
                                    }
                                });
                            },
                            error: function(model, response){
                                ok(wind.get('id') !== '', 'Wind was created on the server');
                                start();
                            }
                        });
                    }
                });
            });
        }
    };

    return modelTests;
});