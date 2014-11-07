define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/response/burn.html',
    'model/weatherers/burn',
    'moment',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, BurnModel, moment){
    var inSituBurnForm = FormModal.extend({
        title: 'In-Situ Burn Response',
        className: 'modal fade form-modal insituburn-form',

        initialize: function(options, burnModel){
            FormModal.prototype.initialize.call(this, options, burnModel);
            this.model = burnModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                time: moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm')
            });
            FormModal.prototype.render.call(this, options);

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
        }
    });

    return inSituBurnForm;
});
