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
        },

        update: function(){
            var startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var boomedOilArea = this.$('#oilarea').val();
            var boomedAreaUnits = this.$('#areaunits').val();
            var boomedOilThickness = this.$('#oilthickness').val();
            var boomedThicknessUnits = this.$('#thicknessunits').val();

            this.model.set('active_start', startTime.format('YYYY-MM-DDTHH:mm:ss'));

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        }
    });

    return inSituBurnForm;
});
