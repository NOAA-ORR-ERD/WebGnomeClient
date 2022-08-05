define([
    'underscore',
    'backbone',
    'model/movers/base',
    'model/environment/tide',
    'cesium',
    'model/visualization/mover_appearance'
], function(_, Backbone, BaseMover, GnomeTide, Cesium, MoverAppearance){
    'use strict';
    var catsMover = BaseMover.extend({
        urlRoot: '/mover/',
        defaults: function() { 
            return {
                _appearance: new MoverAppearance(),
                obj_type: 'gnome.movers.c_current_movers.CatsMover'
            };
        },

        model: {
            tide: GnomeTide
        },

        initialize: function(options) {
            BaseMover.prototype.initialize.call(this, options);
            console.log(this.cid);
        },

        toTree: function() {
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var name = this.get('name');
            var active = this.get('on');
            var uncertEddyDiff = this.get('uncertain_eddy_diffusion') + ' cm^2 / s';
            var attrs = [];

            var activeRange = this.get('active_range').map(function(time) {
                if (time === 'inf') {
                    return 'infinity';
                }
                else if (time === '-inf') {
                    return '-infinity';
                }
                else {
                    return time;
                }
            });

            attrs.push({title: 'Name: ' + name, key: 'Name',
                        obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'On: ' + active, key: 'On',
                        obj_type: this.get('on'), action: 'edit', object: this});

            attrs.push({title: 'Uncertain Eddy Diffusion: ' + uncertEddyDiff,
                        key: 'Uncertain Eddy Diffusion',
                        obj_type: this.get('uncertain_eddy_diffusion'),
                        action: 'edit', object: this});

            attrs.push({title: 'Active Range: ' + activeRange,
                        key: 'Active Range',
                        obj_type: this.get('active_range'),
                        action: 'edit', object: this
            });

            tree = attrs.concat(tree);

            return tree;
        }
    });

    return catsMover;
});