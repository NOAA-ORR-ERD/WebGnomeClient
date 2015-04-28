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
            console.log(this.model);
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
            var dateTime = this.$('#datetime').val();
            var amount = this.$('#beached-amount').val();

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        addBeachedAmount: function(e){
            e.preventDefault();
            var dateObj = moment(this.$('#datetime').val(), webgnome.config.date_format.moment);
            var date = dateObj.format('YYYY-MM-DDTHH:mm:00');
            var amount = this.$('#beached-amount').val();

            var entry = [date, [amount]];
            var incrementer = parseInt(this.$('#incrementCount').val(), 10);
            var not_replaced = true;

            _.each(this.model.get('timeseries'), function(el, index, array){
                if(el[0] === entry[0]){
                    not_replaced = false;
                    array[index] = entry;
                }
            });

            if(not_replaced) {
                this.model.get('timeseries').push(entry);
            }

            dateObj.add('h', incrementer);

            this.renderTimeseries();
        },

        renderTimeseries: function(){
            this.model.sortTimeseries();

            var html = '';
            _.each(this.model.get('timeseries'), function(el, index){
                console.log(el);
                var beached = el[1][0];
                var date = moment(el[0]).format(webgnome.config.date_format.moment);
                var compiled = _.template(StaticRowTemplate);
                var template = compiled({
                    tsindex: index,
                    date: date,
                    amount: beached
                });
                html += template;
            });
            this.$('table tbody').html(html);
        }

    });

    return beachedForm;
});