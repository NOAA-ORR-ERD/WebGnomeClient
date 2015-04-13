define([
    'underscore',
    'model/spill',
], function(_, GnomeSpill){
    var spillTest = {
        run: function() {
            QUnit.module('Spill');
            this.test();
        },
        test: function() {
            asyncTest('Local spill creation', function(){
                var spill = new GnomeSpill();
                ok(spill.cid, 'Spill has a client id.');
                ok(spill.get('release'), 'Spill has a release object.');
                ok(spill.get('element_type'), 'Spill has an element_type');
                ok(spill.toTree().length > 0, 'spill to tree works');
                start();
            });

            asyncTest('Persist spill to server', function(){
                var persist_spill = new GnomeSpill();
                var persist_test = function(model, response, options){
                    ok(response.id, "Spill has py_gnome given id");
                    ok(response.release, "Spill has a release");
                    ok(response.element_type, "Spill has an element_type");
                    ok(model.toTree().length > 0, 'spill to tree works');
                    start();
                };
                persist_spill.save(null, {
                    validate: false,
                    error: persist_test,
                    success: persist_test
                });
            });
    
            asyncTest('Get spill from server', function(){
                var get_test = function(model, response, options){
                    ok(response.id, "Spill has py_gnome given id.");
                    ok(model.toTree().length > 0, 'spill to tree works');

                    start();
                };
                var start_get = function(model, response, options) {
                    model.fetch({
                        error: get_test,
                        success: get_test
                    });
                };
                var get_spill = new GnomeSpill();
                get_spill.save(null, {
                    validate: false,
                    error: start_get,
                    success: start_get
                });
            });
                
            asyncTest('Update spill', function(){
                var spill_id;
                var release_id;
                var update_spill = new GnomeSpill();
                var update_test = function(model, response, options){
                    equal(response.id, spill_id, "The same spill was updated.");
                    equal(response.release.id, release_id, "The same release was updated.");
                    equal(response.on, false, "Spill was turned off successfully");
                    deepEqual(model.get('release').get('start_position'), [1,1,0], "The release start position was updated");
                    ok(model.toTree().length > 0, 'spill to tree works');
                    start();
                };
                var update_start = function(model, response, options){
                    spill_id = model.id;
                    release_id = model.get('release').id;
                    model.once('change', _.bind(function(){
                        this.save(null, {
                            validate: false,
                            error: update_test,
                            success: update_test
                        });
                    }, model));
                    model.get('release').set('start_position', [1,1,0]);
                    model.set('on', false);

                };
                update_spill.save(null, {
                    validate: false,
                    error: update_start,
                    success: update_start
                });
            });
        }
    };

    return spillTest;
});