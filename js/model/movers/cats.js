define([
    'underscore',
    'backbone',
    'model/movers/base',
    'model/environment/tide'
], function(_, Backbone, BaseMover, GnomeTide){
    var catsMover = BaseMover.extend({
        urlRoot: '/mover/',

        defaults: {
            obj_type: 'gnome.movers.current_movers.CatsMover'
        },

        model: {
            tide: GnomeTide
        },

        validate: function(attrs, options){
            //TODO: Consult with Caitlin about the values that need to be calculated "on the fly" i.e. unscaled val at ref point
        },

        toTree: function() {
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var name = this.get('name');
            var active = this.get('on');
            var uncertEddyDiff = this.get('uncertain_eddy_diffusion') + ' cm^2 / s';
            var activeStart = this.get('active_start');
            var activeStop = this.get('active_stop');
            var attrs = [];

            activeStart = activeStart === '-inf' ? '-infinity' : activeStart;
            activeStop = activeStop === 'inf' ? 'infinity' : activeStop;

            attrs.push({title: 'Name: ' + name, key: 'Name',
                         obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'On: ' + active, key: 'On',
                         obj_type: this.get('on'), action: 'edit', object: this});

            attrs.push({title: 'Uncertain Eddy Diffusion: ' + uncertEddyDiff, key: 'Uncertain Eddy Diffusion',
                         obj_type: this.get('uncertain_eddy_diffusion'), action: 'edit', object: this});

            attrs.push({title: 'Active Start: ' + activeStart, key: 'Active Start',
                         obj_type: this.get('active_start'), action: 'edit', object: this});

            attrs.push({title: 'Active Stop: ' + activeStop, key: 'Active Stop',
                         obj_type: this.get('active_stop'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return catsMover;
});