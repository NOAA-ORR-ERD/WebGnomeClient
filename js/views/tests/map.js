define([
    'jquery',
    'underscore',
    'backbone',
    'model/map'
], function($, _, Backbone, GnomeMap){
    var mapTests = {
        run: function(){
            QUnit.module('Map');
            this.test();
        },

        test: function(){

            asyncTest('Create a new Gnome Map', function(){
                map = new GnomeMap({obj_type: 'gnome.map.GnomeMap'});
                map.save(null, {
                    validate: false,
                    success: function(){
                        ok(!_.isUndefined(map.get('id')), 'map was created');
                        ok(map.toTree().length > 0, 'map toTree works');
                        start();
                    },
                    error: function(){
                        ok(!_.isUndefined(map.get('id')), 'map was created');
                        ok(map.toTree().length > 0, 'map toTree works');
                        start();
                    }
                });
            });
        }
    };

    return mapTests;
});