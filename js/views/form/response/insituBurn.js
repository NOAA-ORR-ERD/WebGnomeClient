define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/form/response/base',
    'text!templates/form/response/burn.html',
    'model/weatherers/burn',
    'moment',
    'nucos',
    'jqueryDatetimepicker',
    'jqueryui/slider'
], function($, _, Backbone, module, ResponseFormModal, FormTemplate, BurnModel, moment, nucos){
    var inSituBurnForm = ResponseFormModal.extend({
        title: 'In-Situ Burn Response',
        className: 'modal response fade form-modal insituburn-form',

        initialize: function(options, burnModel){
            this.module = module;
            ResponseFormModal.prototype.initialize.call(this, options, burnModel);
            this.model = burnModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm')
            });
            ResponseFormModal.prototype.render.call(this, options);
        },

        convertLength: function(length, units){
            switch (units) {
                case "mm":
                  return parseFloat(length) / 1000;
                case "in":
                  return parseFloat(length) / 39.370;
                case "cm":
                  return parseFloat(length) / 100;
            }
        },

        update: function(){
            ResponseFormModal.prototype.update.call(this);
            var boomedOilArea = this.$('#oilarea').val();
            var boomedAreaUnits = this.$('#areaunits').val();
            var boomedOilThickness = this.$('#oilthickness').val();
            var boomedThicknessUnits = this.$('#thicknessunits').val();
            var start_time = this.startTime;

            var thicknessInMeters = this.convertLength(boomedOilThickness, boomedThicknessUnits);
            var waterFract = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('emulsion_water_fraction_max');
            var burnDuration = nucos._BurnDuration(thicknessInMeters, waterFract);

            this.model.set('active_start', this.startTime.format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('active_stop', start_time.add(burnDuration, 's').format('YYYY-MM-DDTHH:mm:ss'));
        }
    });

    return inSituBurnForm;
});
