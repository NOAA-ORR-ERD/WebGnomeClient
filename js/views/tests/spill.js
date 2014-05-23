define([
    'underscore',
    'model/spill',
], function(_, GnomeSpill, SessionModel){
    var spillTest = {
        run: function() {
            this.test();
        },
        test: function() {
            // local spill
                test("Local spill creation", function(){
                    var spill = new GnomeSpill();
                    ok(spill.cid, "Spill has a client id.");
                    ok(spill.get('release'), "Spill has a release object.");
                    ok(spill.get('element_type'), "Spill has an element_type");
                });

            // persist spill
                var persist_spill = new GnomeSpill();
                var persist_test = function(model, response, options){
                    test('Persist spill to server', function(){
                        ok(response.id, "Spill has py_gnome given id.");
                        ok(response.release.id, "Spill's release object has a py_gnome given id.");
                        ok(response.release.id, "Spill's element_type object has a py_gnome given id.");
                    });
                };
                persist_spill.save(null, {
                    error: persist_test,
                    success: persist_test
                });

            // get spill
                var get_test = function(model, response, options){
                    test('Get spill from server', function(){
                        ok(response.id, "Spill has py_gnome given id.");
                    });
                };
                var start_get = function(model, response, options) {
                    model.fetch({
                        error: get_test,
                        success: get_test
                    });
                };
                var get_spill = new GnomeSpill();
                get_spill.save(null, {
                    error: start_get,
                    success: start_get
                });
                    
            // update spill
                var spill_id;
                var release_id;
                var update_spill = new GnomeSpill();
                var update_test = function(model, response, options){
                    test('Update spill', function(){
                        equal(response.id, spill_id, "The same spill was updated.");
                        equal(response.release.id, release_id, "The same release was updated.");
                        deepEqual(response.release.get('start_position'), [1,1,0], "The release start position was updated");
                    });
                };
                var update_start = function(model, response, options){
                    model.parse(response);
                    spill_id = model.id;
                    release_id = model.get('release').id;
                    console.log(model);
                    model.get('release').on('change', _.bind(function(){
                        this.save(null, {
                            error: update_test,
                            success: update_test
                        });
                    }, model));
                    model.get('release').set('start_position', [1,1,0]);

                };
                update_spill.save(null, {
                    error: update_start,
                    success: update_start
                });
        }
    };

    return spillTest;
});