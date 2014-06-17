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
                        ok(model.id, 'Gnome model has an api given id');
                        model.get('map_id').on('change', function(){
                            equal(model.get('map_id').get('obj_type'), 'gnome.map.GnomeMap', 'Gnome model has a hydrated map object');
                            start();
                        });
                    });
                }});
        }
    };

    return modelTests;
});