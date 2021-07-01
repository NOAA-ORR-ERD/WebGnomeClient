define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/modal/form',
    'text!templates/risk/input.html',
    'text!templates/risk/slider_input.html',
    'nucos',
    'jqueryui/widgets/slider'
], function($, _, Backbone, moment, FormModal, RiskTemplate, SliderTemplate, nucos) {
    var riskForm = FormModal.extend({
        className: 'modal form-modal risk-form',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            var formattedTime = moment(this.model.get('assessment_time')).format('YYYY/M/D H:mm');
            this.body = _.template(RiskTemplate)({
                depth: this.model.get('depth')
            });

            FormModal.prototype.render.call(this, options);
            this.$('#depth-units option[value="' + this.model.get('units').depth + '"]').prop('selected', 'selected');

            this.createSlider('distance', 'Distance From Shore (km):', this.model.get('distance'), 1, 20);
            this.createSlider('depth', 'Mixed Layer Depth (m):', this.model.get('depth'), 5, 100);

            if (!webgnome.validModel()) {
                this.$('.next').addClass('disabled');
            }

        },

        createSlider: function(selector, selectorName, value, min, max){
            var sliderTemplate = _.template(SliderTemplate)({
                'selector': selector,
                'selectorName': selectorName,
                'max': max,
                'min': min
            });

            this.$('.sliders-container').append(sliderTemplate);
            
            this.$('#' + selector + ' .slider').slider({
                    max: max,
                    min: min,
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$('#' + selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                           this.updateTooltipWidth();
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$('#' + selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                           this.updateTooltipWidth();
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.update();
                        }, this)
            });
        },

        // overide the 'Next' button event method
        save: function(callback){
            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();

                this.model.assessment();
                this.hide();
                this.trigger('save', [this.model]);
                if(_.isFunction(callback)){ callback(); }
            }
        },

        update: function(e){
            var depth = this.$('#depth .slider').slider('value');
            var distance = this.$('#distance .slider').slider('value');
            
            this.model.set('depth', depth);
            this.model.set('distance', distance);

            if(this.model.isValid()){
                this.$('.next').removeClass('disabled');
            }

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }

    });

    return riskForm;
});
