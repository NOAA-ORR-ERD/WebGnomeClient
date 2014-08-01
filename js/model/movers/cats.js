define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/tide'
], function(_, Backbone, BaseModel, GnomeTide){
    var currentMover = BaseModel.extend({
        urlRoot: '/mover/',

        defaults: {
            obj_type: 'gnome.movers.current_movers.CatsMover'
        },

        model: {
            tide: GnomeTide
        },

        toTree: function() {
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var uncertEddyDiff = this.get('uncertain_eddy_diffusion') + ' cm^2 / s';
            var attrs = [];

            attrs.push({title: 'Uncertain Eddy Diffusion: ' + uncertEddyDiff, key: 'Uncertain Eddy Diffusion',
                         obj_type: this.get('uncertain_eddy_diffusion'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return currentMover;
});