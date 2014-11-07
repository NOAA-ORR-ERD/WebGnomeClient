define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/response/disperse.html',
    'model/weatherers/dispersion'
], function($, _, Backbone, FormModal, FormTemplate, DisperseModel){
    var disperseForm = FormModal.extend({
        title: 'Disperse Response',
        className: 'modal fade form-modal disperse-form',

        initialize: function(options, disperseModel){
            FormModal.prototype.initialize.call(this, options, disperseModel);
            this.model = disperseModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate);
            FormModal.prototype.render.call(this, options);
        }
    });

    return disperseForm;
});