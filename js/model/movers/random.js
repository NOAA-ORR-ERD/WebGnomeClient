define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var randomMover = BaseModel.extend({
        urlRoot: '/mover/',

        defaults: {
            obj_type: 'gnome.movers.random_movers.RandomMover'
        },

        validate: function(attrs, options) {
            var diffuse = attrs.diffusion_coef;
            var uncertain = attrs.uncertain_factor;
            if (!isNaN(parseInt(diffuse, 10)) && !isNaN(parseInt(uncertain, 10))){
                if (attrs.diffusion_coef < 0){
                    return 'Diffusion coefficient must be greater than zero!';
                }
                if (attrs.uncertain_factor < 0){
                    return 'Uncertainty factor must be greater than zero!';
                }
            } else {
                if (diffuse === '' || uncertain === ''){
                    return 'That field cannot be blank!';
                }
                return 'Diffusion coefficient and Uncertainty factor must be numbers!';
            }
        },

        toTree: function() {
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var diffuseCoef = this.get('diffusion_coef') + ' cm^2 / s';
            var uncertFactor = this.get('uncertain_factor');
            var on = this.get('on');

            attrs.push({title: 'Diffusion Coefficient: ' + diffuseCoef, key: 'Diffusion Coefficient',
                         obj_type: this.get('diffusion_coef'), action: 'edit', object: this});

            attrs.push({title: 'On: ' + on, key: 'On', obj_type: this.get('on'), action: 'edit', object: this});

            attrs.push({title: 'Uncertain Factor: ' + uncertFactor, key: 'Uncertain Factor',
                         obj_type: this.get('uncertain_factor'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }  
    });

    return randomMover;
});