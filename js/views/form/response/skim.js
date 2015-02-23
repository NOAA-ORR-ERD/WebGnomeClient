define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/response/base',
    'text!templates/form/response/skim.html',
    'model/weatherers/skim',
    'moment',
    'jqueryDatetimepicker',
    'jqueryui/slider'
], function($, _, Backbone, module, ResponseFormModal, FormTemplate, SkimModel, moment){
    var skimForm = ResponseFormModal.extend({
        title: 'Skim Response',
        className: 'modal response fade form-modal skim-form',

        events: function(){
            return _.defaults({
                'click .constant': 'convertToAmount',
                'click .amount': 'convertToRate',
                'keyup #duration': 'updateRateAmount'
            }, ResponseFormModal.prototype.events());
        },

        initialize: function(options, skimModel){
            this.module = module;
            ResponseFormModal.prototype.initialize.call(this, options, skimModel);
            this.model = skimModel;
        },

        updateRateAmount: function(){
            this.convertToRate();
            this.convertToAmount();
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: this.parseDuration(this.model.get('active_start'), this.model.get('active_stop')),
                amount: this.model.get('amount'),
                units: this.model.get('units')
            });
            ResponseFormModal.prototype.render.call(this, options);
            this.convertToRate();
            this.$('.slider').slider('value', this.model.get('efficiency') * 100);
        },

        convertToAmount: function(){
            var recoveryRate = parseFloat(this.$('#recovery-rate').val());
            var recoveryRateUnits = this.$('#rate-units').val();
            var amountUnits = recoveryRateUnits.substr(0, recoveryRateUnits.indexOf('/'));
            var duration = parseFloat(this.$('#duration').val());
            if (_.isNumber(recoveryRate) && _.isNumber(duration)){
                var amountRecovered = parseFloat(recoveryRate) * parseFloat(duration);
                this.$('#recovery-amount').val(amountRecovered);
                this.$('#amount-units').val(amountUnits);
            }
        },

        convertToRate: function(){
            var amount = parseFloat(this.$('#recovery-amount').val());
            var duration = parseFloat(this.$('#duration').val());
            var amountUnits = this.$('#amount-units').val() + '/hr';
            if (_.isNumber(amount) && _.isNumber(duration)){
                var recoveryRate = amount / duration;
                this.$('#recovery-rate').val(recoveryRate);
                this.$('#rate-units').val(amountUnits);
            }
        },

        update: function(){

            ResponseFormModal.prototype.update.call(this);

            var duration = parseFloat(this.$('#duration').val());
            var endTime = this.startTime.add(duration, 'h').format('YYYY-MM-DDTHH:mm:ss');
            var recoveryRate = this.$('#recovery-rate').val();
            var rateUnits = this.$('#rate-units').val();
            var recoveryAmount = this.$('#recovery-amount').val();
            var amountUnits = this.$('#amount-units').val();

            this.model.set('active_stop', endTime);
            this.model.set('efficiency', this.efficiencyValue);
            this.model.set('amount', recoveryAmount);
            this.model.set('units', amountUnits);
        }
    });

    return skimForm;
});