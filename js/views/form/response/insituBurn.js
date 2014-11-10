define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'text!templates/form/response/burn.html',
    'model/weatherers/burn',
    'moment',
    'jqueryDatetimepicker'
], function($, _, Backbone, ResponseFormModal, FormTemplate, BurnModel, moment){
    var inSituBurnForm = ResponseFormModal.extend({
        title: 'In-Situ Burn Response',
        className: 'modal fade form-modal insituburn-form',

        initialize: function(options, burnModel){
            ResponseFormModal.prototype.initialize.call(this, options, burnModel);
            this.model = burnModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm')
            });
            ResponseFormModal.prototype.render.call(this, options);
        },

        update: function(){
            var startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var boomedOilArea = this.$('#oilarea').val();
            var boomedAreaUnits = this.$('#areaunits').val();
            var boomedOilThickness = this.$('#oilthickness').val();
            var boomedThicknessUnits = this.$('#thicknessunits').val();

            this.model.set('active_start', startTime.format('YYYY-MM-DDTHH:mm:ss'));

            ResponseFormModal.prototype.update.call(this);
        }
    });

    return inSituBurnForm;
});
