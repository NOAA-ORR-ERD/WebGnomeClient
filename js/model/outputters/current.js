define([
    'underscore',
    'backbone',
    'model/base',
    'model/movers/cats'
], function(_, Backbone, BaseModel, CatsMover){
    currentOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        model: {
            current_mover: CatsMover
            // current_mover: {
            //     'gnome.movers.current_movers.CatsMover': CatsMover
            // }
        },

        defaults: {
            'obj_type': 'gnome.outputters.geo_json.CurrentGridGeoJsonOutput',
            'name': 'Outputter',
            'output_last_step': 'true',
            'output_zero_step': 'true',
        },

        toTree: function(){
            return '';
        }
    });

    return currentOutputter;
});