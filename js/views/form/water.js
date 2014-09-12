define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/water.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, WaterTemplate){
    var waterForm = FormModal.extend({
    	className: 'modal fade form-modal model-form',
    	title: 'Water',

    	events: function(){
    		return _.defaults({
    			'change select': 'revealManualInputs'
    		}, FormModal.prototype.events);
    	},

    	initialize: function(options, model){
    		FormModal.prototype.initialize.call(this, options);
    		this.model = (model ? model : null);
    	},

    	render: function(options){
    		this.body = _.template(WaterTemplate, {});

    		FormModal.prototype.render.call(this, options);

    	},

        convertTemptoK: function(val, unit){
            val = parseFloat(val, 10);
            var temp = val;
            if (unit === 'F'){
                temp = (5/9) * (val - 32);
            }
            temp += 273.15;

            return temp;
        },

        convertHeighttoKM: function(val, unit){
            val = parseFloat(val, 10);
            var height = val;
            height = unit === 'm' ? height / 1000 : height / 3280.8;
            return height;
        },

        otherValues: function(val, inputType){
            if (val === 'other'){
                val = this.$('#' + inputType + '-manual').val();
            }
            return val;
        },

    	update: function(){
    		var waterTemp = this.convertTemptoK(this.$('#temp').val(), this.$('#tempunits option:selected').val());
            var salinity = this.otherValues(this.$('#salinity option:selected').val(), 'salinity');
            var sedimentLoad = this.otherValues(this.$('#sediment option:selected').val(), 'sediment');
            var sedimentMaterial = this.$('#sediment-element option:selected').val();
            var seaHeight = this.convertHeighttoKM(this.$('#sea-height').val(), this.$('#height-units option:selected').val());

            this.model.set('water_temp', waterTemp);
            this.model.set('salinity', salinity);
            this.model.set('sediment_load', sedimentLoad);
            this.model.set('sediment_material', sedimentMaterial);
            this.model.set('sea_height', seaHeight);

    		if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
    	},

    	revealManualInputs: function(e){
    		var value = e.currentTarget.value;
    		var id = e.currentTarget.id;
    		if (value === 'other' && id !== this.selectedId){
    			this.$('#' + id + '-entry').removeClass('hide');
    		} else {
    			this.$('#' + id + '-entry').addClass('hide');
                this.update();
                console.log("update fired");
    		}
    		this.selectId = id;
    	}

    });

    return waterForm;
});