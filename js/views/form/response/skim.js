define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'views/form/response/adios_base',
    'text!templates/form/response/skim.html',
    'model/weatherers/skim',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, Backbone, module, moment,
            ResponseFormModal, FormTemplate, SkimModel) {
    'use strict';
    var skimForm = ResponseFormModal.extend({
        title: 'ADIOS Skim Response',
        className: 'modal response form-modal skim-form',

        events: function() {
            return _.defaults({
                'change #recovery-rate': 'convertToAmount',
                'change #recovery-amount': 'convertToRate',
                'change #duration': 'updateRateAmount',
                'change #rate-units': 'convertToAmount',
                'change #amount-units': 'convertToRate',
                'mouseup #duration': 'updateRateAmount'
            }, ResponseFormModal.prototype.events());
        },

        initialize: function(options, skimModel) {
            this.module = module;
            ResponseFormModal.prototype.initialize.call(this, options, skimModel);
            this.model = skimModel;
        },

        updateRateAmount: function() {
            this.convertToAmount();
        },

        render: function(options) {
            var [startTime, stopTime] = this.model.get('active_range');
            var modelStartTime = webgnome.model.get('start_time');
            var formTime = (startTime === '-inf') ? modelStartTime : startTime;

            var duration = this.model.isNew() ? '' : this.parseDuration(startTime, stopTime);


            this.body = _.template(FormTemplate)({
                name: this.model.get('name'),
                time: moment(formTime).format('YYYY/M/D H:mm'),
                duration: duration,
                amount: this.model.get('amount'),
                units: this.model.get('units')
            });

            ResponseFormModal.prototype.render.call(this, options);

            this.convertToRate();
            this.$('.slider').slider('value', this.model.get('efficiency') * 100);
            this.setUnitSelects();
            this.updateEfficiency();
            this.update();
        },

        setUnitSelects: function() {
            var units = this.model.get('units');

            this.$('#rate-units').val(units + '/hr');
            this.$('#amount-units').val(units);
        },

        convertToAmount: function() {
            var recoveryRate = parseFloat(this.$('#recovery-rate').val());
            var recoveryRateUnits = this.$('#rate-units').val();
            var amountUnits = recoveryRateUnits.substr(0, recoveryRateUnits.indexOf('/'));
            var duration = parseFloat(this.$('#duration').val());

            if (_.isNumber(recoveryRate) && _.isNumber(duration) &&
                    !(isNaN(recoveryRate) || isNaN(duration))) {
                var amountRecovered = parseFloat(recoveryRate) * parseFloat(duration);

                this.$('#recovery-amount').val(amountRecovered);
                this.$('#amount-units').val(amountUnits);
            }
        },

        convertToRate: function() {
            var amount = parseFloat(this.$('#recovery-amount').val());
            var duration = parseFloat(this.$('#duration').val());
            var amountUnits = this.$('#amount-units').val() + '/hr';

            if (_.isNumber(amount) && _.isNumber(duration) &&
                    !(isNaN(amount) || isNaN(duration))) {
                var recoveryRate = amount / duration;

                this.$('#recovery-rate').val(recoveryRate);
                this.$('#rate-units').val(amountUnits);
            }
        },

        update: function() {
            ResponseFormModal.prototype.update.call(this);

            var duration = parseFloat(this.$('#duration').val());

            var activeStart = this.startTime.format('YYYY-MM-DDTHH:mm:ss');
            var activeEnd   = this.startTime.add(duration, 'h').format('YYYY-MM-DDTHH:mm:ss');

            var recoveryRate = this.$('#recovery-rate').val();
            var rateUnits = this.$('#rate-units').val();
            var recoveryAmount = this.$('#recovery-amount').val();
            var amountUnits = this.$('#amount-units').val();

            this.model.set('active_range', [activeStart, activeEnd]);
            this.model.set('amount', recoveryAmount);
            this.model.set('units', amountUnits);
        }
    });

    return skimForm;
});
