define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/modal/form',
    'text!templates/risk/input.html',
    'nucos',
    'jqueryDatetimepicker'
], function($, _, Backbone, moment, FormModal, RiskTemplate, nucos) {
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
            this.body = _.template(RiskTemplate, {
                depth: this.model.get('depth')
            });

            FormModal.prototype.render.call(this, options);
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

                this.model.assessment();
                this.hide();
                this.trigger('save', [this.model]);
                if(_.isFunction(callback)){ callback(); }
            }
        },

        update: function(e){
            this.model.set('depth', this.$('#average-water-depth').val());

            var units = this.model.get('units');
            units.depth = this.$('#depth-units').val();

            this.model.set('units', units);

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
