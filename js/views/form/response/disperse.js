define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'views/form/response/adios_base',
    'text!templates/form/response/disperse.html',
    'model/weatherers/dispersion',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment,
            ResponseFormModal, FormTemplate, DisperseModel){
    'use strict';
    var disperseForm = ResponseFormModal.extend({
        title: 'ADIOS Disperse Response',
        className: 'modal response form-modal disperse-form',

        initialize: function(options, disperseModel) {
            this.module = module;
            ResponseFormModal.prototype.initialize.call(this, options, disperseModel);
            this.model = disperseModel;
        },

        render: function(options) {
            var [startTime, stopTime] = this.model.get('active_range');
            var modelStartTime = webgnome.model.get('start_time');
            var formTime = (startTime === '-inf') ? modelStartTime : startTime;

            var duration = (this.model.isNew()) ? '' : this.parseDuration(startTime, stopTime);

            var fractSprayed = this.model.get('fraction_sprayed');

            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                time: moment(formTime).format('YYYY/M/D H:mm'),
                percentSprayed: !_.isUndefined(fractSprayed) ? fractSprayed * 100 : '',
                duration: duration
            });

            ResponseFormModal.prototype.render.call(this, options);
        },

        update: function() {
            ResponseFormModal.prototype.update.call(this);

            var sprayedOilPercent = parseInt(this.$('#oilsprayed').val(), 10);
            var dispersedOilPercent = this.$('#oildispersed').val();
            var duration = parseFloat(this.$('#duration').val());
            var startTime = this.startTime.format('YYYY-MM-DDTHH:mm:ss');
            var endTime = this.startTime.add(duration, 'h').format('YYYY-MM-DDTHH:mm:ss');

            this.model.set('fraction_sprayed', sprayedOilPercent / 100);

            this.model.set('active_range', [startTime, endTime]);
        }
    });

    return disperseForm;
});
