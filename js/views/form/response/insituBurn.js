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
                time: this.model.get('active_start') !== '-inf' ? moment(this.model.get('active_start')).format('YYYY/M/D H:mm') : moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                area: this.model.get('area'),
                thickness: this.model.get('thickness'),
                areaUnits: this.model.get('area_units'),
                thicknessUnits: this.model.get('thickness_units')
            });
            ResponseFormModal.prototype.render.call(this, options);

            this.setUnitSelects();
        },

        setUnitSelects: function(){
            var areaUnits = this.model.get('area_units');
            var thicknessUnits = this.model.get('thickness_units');

            this.$('#areaunits').val(areaUnits);
            this.$('#thicknessunits').val(thicknessUnits);
        },

        convertLength: function(length, units){
            var len = parseFloat(length);
            switch (units) {
                case "mm":
                  return len / 1000;
                case "in":
                  return len / 39.370;
                case "cm":
                  return len / 100;
            }
        },

        convertArea: function(area, units){
            var numArea = parseFloat(area);
            switch (units){
                case "ft^2":
                    return numArea / 10.7639;
                case "yd^2":
                    return numArea / 1.19599;
                case "m^2":
                    return numArea;
            }
        },

        update: function(){
            ResponseFormModal.prototype.update.call(this);
            var boomedOilArea = this.$('#oilarea').val();
            var boomedAreaUnits = this.$('#areaunits').val();
            var boomedOilThickness = this.$('#oilthickness').val();
            var boomedThicknessUnits = this.$('#thicknessunits').val();
            var start_time = this.startTime;
            var efficiencyVal = this.efficiencyValue;

            var thicknessInMeters = this.convertLength(boomedOilThickness, boomedThicknessUnits);
            var waterFract = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('emulsion_water_fraction_max');
            var burnDuration = nucos._BurnDuration(thicknessInMeters, waterFract);

            this.model.set('active_start', this.startTime.format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('active_stop', start_time.add(burnDuration, 's').format('YYYY-MM-DDTHH:mm:ss'));
            this.model.set('area', boomedOilArea);
            this.model.set('thickness', boomedOilThickness);
            this.model.set('area_units', boomedAreaUnits);
            this.model.set('thickness_units', boomedThicknessUnits);
            this.model.set('efficiency', efficiencyVal);
        }
    });

    return inSituBurnForm;
});
