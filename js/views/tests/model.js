define([
    'underscore',
    'model/gnome'
], function(_, GnomeModel){
    var modelTests = {
        run: function(){
            this.test();
        },

        test: function(){
            // Gnome Model
                model = new GnomeModel();
                model.save(null, {validate: false, success: function(){
                    asyncTest('Gnome Model Creation', function(){
                        ok(model.get('id') !== '', 'Gnome model has an api given id');
                        model.on('ready', function(){
                            equal(model.get('map_id').get('obj_type'), 'gnome.map.GnomeMap', 'Gnome model has a hydrated map object');

                            model.set('duration', 2);
                            model.save(null, {validate: false, success: function(){
                                asyncTest('Gnome Model Update', function(){
                                    equal(model.get('duration', 2, 'Duration has been updated'));
                                    equal(model.get('map_id').get('obj_type'), 'gnome.map.GnomeMap', 'Model still has access to a hydrated map object');
                                    start();
                                });
                            }});
                            start();
                        });
                    });
                }});
        }
    };

    return modelTests;
});