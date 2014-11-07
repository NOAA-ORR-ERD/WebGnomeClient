define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/response/disperse.html',
    'model/weatherers/dispersion',
    'moment',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, DisperseModel, moment){
    var disperseForm = FormModal.extend({
        title: 'Disperse Response',
        className: 'modal fade form-modal disperse-form',

        initialize: function(options, disperseModel){
            FormModal.prototype.initialize.call(this, options, disperseModel);
            this.model = disperseModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate,{
                time: moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: 4
            });
            FormModal.prototype.render.call(this, options);
            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
        },

        update: function(){
            var startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var duration = parseFloat(this.$('#duration').val());
            var endTime = startTime.add(duration, 'h').format('YYYY-MM-DDTHH:mm:ss');
            var sprayedOilPercent = this.$('#oilsprayed').val();
            var dispersedOilPercent = this.$('#oildispersed').val();

            this.model.set('active_start', startTime.format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('active_stop', endTime);

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        }
    });

    return disperseForm;
});