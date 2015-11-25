define([
    'underscore',
    'views/modal/form',
    'text!templates/form/map/param.html',
    'model/map/param'
], function(_, FormModal, ParamTemplate, ParamMap){
    var paramMapForm = FormModal.extend({
        title: 'Parameterized Shoreline',

        initialize: function(options){
            this.model = new ParamMap();
            FormModal.prototype.initialize.call(this, options); 
        },

        render: function(){
            this.body = _.template(ParamTemplate, {
                bearing: this.model.get('bearing')
            });
            FormModal.prototype.render.call(this);
        }
    });

    return paramMapForm;
});