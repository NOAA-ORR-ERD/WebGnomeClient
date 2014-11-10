define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'text!templates/form/response/skim.html',
    'model/weatherers/skim',
    'moment',
    'jqueryDatetimepicker'
], function($, _, Backbone, ResponseFormModal, FormTemplate, SkimModel, moment){
    var skimForm = ResponseFormModal.extend({
        title: 'Skim Response',
        className: 'modal fade form-modal skim-form',

        initialize: function(options, skimModel){
            FormModal.prototype.initialize.call(this, options, skimModel);
            this.model = skimModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: this.parseDuration(this.model.get('active_start'), this.model.get('active_stop'))
            });
            FormModal.prototype.render.call(this, options);
        },

        update: function(){
            var startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');

            this.model.set('active_start', startTime.format('YYYY-MM-DDTHH:mm:ss'));

            var duration = parseFloat(this.$('#duration').val());
            var endTime = startTime.add(duration, 'h').format('YYYY-MM-DDTHH:mm:ss');
            var recoveryRate = this.$('#recovery-rate').val();
            var rateUnits = this.$('#rate-units').val();
            var recoveryAmount = this.$('#recovery-amount').val();
            var amountUnits = this.$('#amount-units').val();

            this.model.set('active_stop', endTime);

            ResponseFormModal.prototype.update.call(this);
        }
    });

    return skimForm;
});