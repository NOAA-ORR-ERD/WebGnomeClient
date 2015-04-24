define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'nucos',
    'views/modal/form',
    'text!templates/form/beached.html',
    'text!templates/form/beached/input-static.html',
    'text!templates/form/beached/input-edit.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, moment, nucos, FormModal, BeachedTemplate, StaticRowTemplate, EditRowTemplate){
    var beachedForm = FormModal.extend({
        className: 'modal fade form-modal model-form',
        title: 'Beached Oil',

        events : function(){
            return _.defaults({
                'click .add': 'addBeachedAmount'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model){
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(BeachedTemplate, {});

            FormModal.prototype.render.call(this, options);

            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('#datetime').datetimepicker('show');
            }, this));
        },

        update: function(){
            var amount = this.$('#beached-amount').val();



            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        addBeachedAmount: function(){
            var dateObj = moment(this.$('#datetime').val(), webgnome.config.date_format.moment);
            var date = dateObj.format('YYYY-MM-DDTHH:mm:00');
            var amount = this.$('#beached-amount').val();

            var entry = [date, [amount]];
            var incrementer = parseInt(this.$('#incrementCount').val(), 10);

        }

    });

    return beachedForm;
});