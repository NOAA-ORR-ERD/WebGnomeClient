define([
    'model/spill'
], function(GnomeSpill){
    var run = function(){
        // local spill
            test("Local spill creation", function(){
                var spill = new GnomeSpill();
                ok(spill.cid, "Spill has a client id.");
                ok(spill.get('release'), "Spill has a release object.");
                ok(spill.get('element_type'), "Spill has an element_type");
            });

        // persist spill
            var persist_spill = new GnomeSpill();
            var persist_test = function(){
                test('Persist spill to server', function(){
                    ok(persist_spill.id, "Spill has py_gnome given id.");
                    ok(persist_spill.get('release').id, "Spill's release object has a py_gnome given id.");
                    ok(persist_spill.get('element_type').id, "Spill's element_type object has a py_gnome given id.");
                });
            };
            persist_spill.save(null, {
                error: persist_test,
                success: persist_test
            });

        // update spill
            var update_spill = new GnomeSpill();
            var update_test = function(){
                test('Update spill', function(){
                    equal(update_spill.id, spill_id, "The same spill was updated.");
                    equal(update_spill.get('release').id, release_id, "The same release was updated.");
                });
            };
            var update_start = function(){
                var spill_id = update_spill.id;
                var release_id = update_spill.get('release').id;

                var release = update_spill.get('release');
                release.set('start_position', [1,1,0]);
                update_spill.save(null, {
                    error: update_test,
                    success: update_test
                });
            };
            update_spill.save(null, {
                error: update_start,
                success: update_start
            });
            
    };

    return {run: run};
});