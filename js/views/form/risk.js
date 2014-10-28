define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/risk.html',
], function($, _, Backbone, FormModal, RiskTemplate) {
    var riskForm = FormModal.extend({
        className: 'modal fade form-modal risk-form',
        name: 'risk',
        title: 'Environmental Risk Assessment',

        events: function() {
            return _.defaults({
                'shown.bs.modal': 'triggerInputs'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model) {
console.log('initializing!!!!!', options, model);
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(RiskTemplate, {
                area: this.model.get('area'),
                diameter: this.model.get('diameter'),
                distance: this.model.get('distance'),
                depth: this.model.get('depth'),
                hours: this.model.get('time').hours,
                days: this.model.get('time').days,
                surface: this.model.get('surface'),
                column: this.model.get('column'),
                shoreline: this.model.get('shoreline')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#area-units option[value="' + this.model.get('units').area + '"]').attr('selected', 'selected');
            this.$('#diameter-units option[value="' + this.model.get('diameter').area + '"]').attr('selected', 'selected');
            this.$('#distance-units option[value="' + this.model.get('units').distance + '"]').attr('selected', 'selected');
            this.$('#depth-units option[value="' + this.model.get('units').depth + '"]').attr('selected', 'selected');
        },

        update: function(){
            this.model.set('area', this.$('#area').val());
            this.model.set('diameter', this.$('#diameter').val());
            this.model.set('distance', this.$('#distance').val());
            this.model.set('depth', this.$('#depth').val());
            this.model.set('surface', parseFloat(this.$('#surface').val()));
            this.model.set('column', parseFloat(this.$('#column').val()));
            this.model.set('shoreline', parseFloat(this.$('#shoreline').val()));
            
            var time = this.model.get('time');
            time.hours = this.$('#time-hours').val();
            time.days = this.$('#time-days').val();
            
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

        close: function(){
            FormModal.prototype.close.call(this);
        },

        triggerInputs: function(){
            this.$('#data-source').trigger('change');
        }

    });

    return riskForm;
});
