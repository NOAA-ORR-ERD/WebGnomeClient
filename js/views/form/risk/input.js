define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/risk/input.html',
], function($, _, Backbone, FormModal, RiskTemplate) {
    var riskForm = FormModal.extend({
        className: 'modal fade form-modal risk-form',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(RiskTemplate, {
                area: this.model.get('area'),
                diameter: this.model.get('diameter'),
                distance: this.model.get('distance'),
                depth: this.model.get('depth'),
                hours: this.model.get('duration').hours,
                days: this.model.get('duration').days,
                surface: this.model.get('surface'),
                column: this.model.get('column'),
                shoreline: this.model.get('shoreline')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#area-units option[value="' + this.model.get('units').area + '"]').attr('selected', 'selected');
            this.$('#diameter-units option[value="' + this.model.get('units').diameter + '"]').attr('selected', 'selected');
            this.$('#distance-units option[value="' + this.model.get('units').distance + '"]').attr('selected', 'selected');
            this.$('#depth-units option[value="' + this.model.get('units').depth + '"]').attr('selected', 'selected');

            if (!webgnome.validModel()) {
                this.$('.next').addClass('disabled');
            }
        },

        // overide the 'Next' button event method
        save: function(callback){
            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();

                this.risk_assessment();

                this.hide();
                this.trigger('save');
                if(_.isFunction(callback)) callback();
            }
        },

        update: function(){
            this.model.set('area', this.$('#water-area').val());
            this.model.set('diameter', this.$('#water-diameter').val());
            this.model.set('distance', this.$('#distance-from-shore').val());
            this.model.set('depth', this.$('#average-water-depth').val());
            
            var duration = this.model.get('duration');
            duration.hours = this.$('#duration-hours').val();
            duration.days = this.$('#duration-days').val();
            
            var units = this.model.get('units');
            units.area = this.$('#area-units').val();
            units.diameter = this.$('#diameter-units').val();
            units.distance = this.$('#distance-units').val();
            units.depth = this.$('#depth-units').val();

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        risk_assessment: function(){
            console.log('assessing risk!!!!!!!');
            var spills = webgnome.model.get('spills');
        }
    });

    return riskForm;
});
