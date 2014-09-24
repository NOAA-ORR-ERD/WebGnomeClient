define([
    'underscore',
    'model/gnome',
    'model/spill'
], function(_, GnomeModel, GnomeSpill){
    var modelTests = {
        run: function(){
            this.test();
        },

        test: function(){

            asyncTest('Empty Gnome Model Creation', function(){
                model = new GnomeModel();
                model.save(null, {validate: false, success: function(){
                    ok(model.get('id') !== '', 'gnome model has an object id');
                    start();
                }});
            });

            asyncTest('Try to retrive an nonexistant model', function(){
                model = new GnomeModel();
                model.set('id', '5918094102-1204258');
                model.fetch({
                    error: function(model, response){
                        ok(response.statusCode == '404', 'gnome model was not found because of nonexistant object id');
                        start();
                    },
                    success: function(model, response){
                        ok(response.statusCode == '404', 'gnome model was not found because of nonexistant object id');
                        start();
                    }
                });
            });

            asyncTest('Adding and removing a Spill to the model', function(){
                var gnomemodel = new GnomeModel();
                gnomemodel.save(null, {
                    validate: false,
                    success: function(){
                        spill = new GnomeSpill();
                        spill.save(null, {
                            validate: false,
                            success: function(){
                                ok(spill.get('id') !== '', 'spill was created on the server');
                                gnomemodel.get('spills').add(spill);
                                gnomemodel.save(null, {
                                    success: function(){
                                        ok(gnomemodel.get('spills').length === 1, 'Spill was added to model');
                                        gnomemodel.get('spills').remove(spill.get('id'));
                                        gnomemodel.save(null, {
                                            success: function(){
                                                ok(gnomemodel.get('spills').length === 0, 'Spill was removed from the model');
                                                start();
                                            },
                                            error: function(){
                                                ok(gnomemodel.get('spills').length === 0, 'Spill was removed from the model');
                                                start();
                                            }
                                        });
                                    },
                                    error: function(model, response){
                                        ok(gnomemodel.get('spills').length === 1, 'Spill was added to model');
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
        }
    };

    return modelTests;
});