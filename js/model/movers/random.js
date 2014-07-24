define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
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
        }    
    });

    return randomMover;
});