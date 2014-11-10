define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'text!templates/form/response/disperse.html',
    'model/weatherers/dispersion',
    'moment',
    'jqueryDatetimepicker'
], function($, _, Backbone, ResponseFormModal, FormTemplate, DisperseModel, moment){
    var disperseForm = ResponseFormModal.extend({
        title: 'Disperse Response',
        className: 'modal fade form-modal disperse-form',

        initialize: function(options, disperseModel){
            ResponseFormModal.prototype.initialize.call(this, options, disperseModel);
            this.model = disperseModel;
        },

        render: function(options){
            this.nameCounter(this.model);
            this.body = _.template(FormTemplate,{
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: this.parseDuration(this.model.get('active_start'), this.model.get('active_stop'))
            });
            ResponseFormModal.prototype.render.call(this, options);
        },

        update: function(){
            var startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');

            this.model.set('active_start', startTime.format('YYYY-MM-DDTHH:mm:ss'));

            var duration = parseFloat(this.$('#duration').val());
            var endTime = startTime.add(duration, 'h').format('YYYY-MM-DDTHH:mm:ss');
            var sprayedOilPercent = this.$('#oilsprayed').val();
            var dispersedOilPercent = this.$('#oildispersed').val();

            this.model.set('active_stop', endTime);

            ResponseFormModal.prototype.update.call(this);
        }
    });

    return disperseForm;
});