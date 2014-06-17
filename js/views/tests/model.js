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
                test('Gnome Model Creation', function(){
                    model = new GnomeModel();
                    model.save(null, {validate: false});
                    ok(model.id, 'Gnome model has an api given id');
                    ok(_.isObject(model.get('map_id')), 'Gnome model has a hydrated map object');
                });
        }
    };

    return modelTests;
});