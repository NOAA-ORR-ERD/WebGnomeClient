define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'text!templates/form/response/skim.html',
    'model/weatherers/skim',
    'moment',
    'jqueryDatetimepicker',
    'jqueryui/slider'
], function($, _, Backbone, ResponseFormModal, FormTemplate, SkimModel, moment){
    var skimForm = ResponseFormModal.extend({
        title: 'Skim Response',
        className: 'modal fade form-modal skim-form',

        initialize: function(options, skimModel){
            ResponseFormModal.prototype.initialize.call(this, options, skimModel);
            this.model = skimModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: this.parseDuration(this.model.get('active_start'), this.model.get('active_stop'))
            });
            ResponseFormModal.prototype.render.call(this, options);

            this.$('.slider').slider({
                min: 0,
                max: 100,
                value: 0,
                create: _.bind(function(){
                    this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="rate-tooltip" class="tooltip-inner">' + 0 + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateEfficiency(ui);
                }, this)
            });
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
        },

        updateEfficiency: function(ui){
            
        }
    });

    return skimForm;
});