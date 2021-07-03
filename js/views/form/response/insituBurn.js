define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'nucos',
    'views/form/response/adios_base',
    'text!templates/form/response/burn.html',
    'model/weatherers/burn',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, nucos,
            ResponseFormModal, FormTemplate, BurnModel) {
    'use strict';
    var inSituBurnForm = ResponseFormModal.extend({
        title: 'ADIOS In-Situ Burn Response',
        className: 'modal response form-modal insituburn-form',

        initialize: function(options, burnModel) {
            this.module = module;
            ResponseFormModal.prototype.initialize.call(this, options, burnModel);
            this.model = burnModel;
        },

        render: function(options) {
            var [startTime, stopTime] = this.model.get('active_range');
            var modelStartTime = webgnome.model.get('start_time');
            var formTime = (startTime === '-inf') ? modelStartTime : startTime;

            this.body = _.template(FormTemplate)({
                name: this.model.get('name'),
                time: moment(formTime).format('YYYY/M/D H:mm'),
                area: this.model.get('area'),
                thickness: this.model.get('thickness'),
                areaUnits: this.model.get('area_units'),
                thicknessUnits: this.model.get('thickness_units')
            });

            ResponseFormModal.prototype.render.call(this, options);

            this.setUnitSelects();
        },

        setUnitSelects: function() {
            var areaUnits = this.model.get('area_units');
            var thicknessUnits = this.model.get('thickness_units');

            this.$('#areaunits').val(areaUnits);
            this.$('#thicknessunits').val(thicknessUnits);
        },

        update: function() {
            ResponseFormModal.prototype.update.call(this);
            var boomedOilArea = this.$('#oilarea').val();
            var boomedAreaUnits = this.$('#areaunits').val();
            var boomedOilThickness = this.$('#oilthickness').val();
            var boomedThicknessUnits = this.$('#thicknessunits').val();
            var start_time = this.startTime;

            var thicknessInMeters = nucos.convert('Length', boomedThicknessUnits,
                                                  'm', boomedOilThickness);
            var substance = webgnome.model.getSubstance();
            var burnDuration, waterFract;

            if(substance.get('is_weatherable')) {
                waterFract = substance.get('emulsion_water_fraction_max');
                burnDuration = nucos._BurnDuration(thicknessInMeters, waterFract);
            }
            else {
                waterFract = substance.get('emulsion_water_fraction_max');
                burnDuration = nucos._BurnDuration(thicknessInMeters, waterFract);
            }

            this.model.set('active_range',
                           [this.startTime.format('YYYY-MM-DDTHH:mm:ss'),
                            start_time.add(burnDuration, 's').format('YYYY-MM-DDTHH:mm:ss')]);

            this.model.set('area', boomedOilArea);
            this.model.set('thickness', boomedOilThickness);
            this.model.set('area_units', boomedAreaUnits);
            this.model.set('thickness_units', boomedThicknessUnits);
        }
    });

    return inSituBurnForm;
});
