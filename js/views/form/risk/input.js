define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/modal/form',
    'text!templates/risk/input.html',
], function($, _, Backbone, moment, FormModal, RiskTemplate) {
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
                assessment_time: this.model.get('assessment_time'),
                surface: this.model.get('surface'),
                column: this.model.get('column'),
                shoreline: this.model.get('shoreline')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#area-units option[value="' + this.model.get('units').area + '"]').attr('selected', 'selected');
            this.$('#diameter-units option[value="' + this.model.get('units').diameter + '"]').attr('selected', 'selected');
            this.$('#distance-units option[value="' + this.model.get('units').distance + '"]').attr('selected', 'selected');
            this.$('#depth-units option[value="' + this.model.get('units').depth + '"]').attr('selected', 'selected');

            this.$('.date').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });

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
            this.model.set('assessment_time', moment(this.$('#assessment_time').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss'));
            
            var units = this.model.get('units');
            units.area = this.$('#area-units').val();
            units.diameter = this.$('#diameter-units').val();
            units.distance = this.$('#distance-units').val();
            units.depth = this.$('#depth-units').val();

//            if(!this.model.isValid()){
//                this.error('Error!', this.model.validationError);
//            } else {
//                this.clearError();
//            }
        },

        risk_assessment: function(){
console.log('assessing risk!!!!!!!');
            var area = this.model.convertAreaToSquareMeters();
            var diameter = this.model.convertDiameterToMeters();
            var distance = this.model.convertDistanceToMeters();
            var depth = this.model.convertDepthToMeters();
console.log('values are ', area, diameter, distance, depth);
            var spills = webgnome.model.get('spills');
            var volumeTotal = 0;
            $.each(spills.models, function(idx, model) {
                var a = model.get('amount');
                switch (model.get('units')) {
                    case 'bbl':
                        a = a * 158.987;
                        break;
                    case 'cubic meters':
                        a = a * 1000;
                        break;
                    case 'gal':
                        a = a * 3.78541;
                        break;
                    case 'ton':
                        a = a * 1018.32416;
                        break;
                    case 'metric ton':
                        a = a * 1165.34;
                        break;
                    default:
                }
                volumeTotal += a;
            });
console.log('volume total is ', volumeTotal);

            // calculate what time step this is
            var startTime = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
            var timeStep = webgnome.model.get('time_step');
            var assessmentTime = moment(this.model.get('assessment_time'), 'YYYY-MM-DDTHH:mm:ss').unix();
            var frame = (assessmentTime - startTime) / timeStep;
console.log('model step info need is ', frame);

// TEMP for testing
            var surface = 0.5,
                column = 0.6,
                shoreline = 0.2;
// TEMP for testing

            this.model.set('surface', surface);
            this.model.set('column', column);
            this.model.set('shoreline', shoreline);
        },

    });

    return riskForm;
});
