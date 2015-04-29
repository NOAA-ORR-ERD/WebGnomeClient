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
        className: 'modal fade form-modal model-form beached-form',
        title: 'Beached Oil',

        events : function(){
            var formModalHash = FormModal.prototype.events;
            delete formModalHash['change input'];
            delete formModalHash['keyup input'];
            formModalHash['change input:not(tbody input)'] = 'update';
            formModalHash['keyup input:not(tbody input)'] = 'update';
            return _.defaults({
                'click .add': 'addBeachedAmount',
                'click .trash': 'removeTimeseriesEntry',
                'click .edit': 'editTimeseriesEntry',
                'click .ok': 'enterTimeseriesEntry',
                'click .undo': 'cancelTimeseriesEntry'
            }, formModalHash);
        },

        initialize: function(options, model){
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
            console.log(this.events());
        },

        render: function(options){
            var date = moment(this.model.get('active_start')).format(webgnome.config.date_format.moment);

            this.body = _.template(BeachedTemplate, {
                unit: this.model.get('units'),
                date: date
            });

            FormModal.prototype.render.call(this, options);

            this.renderTimeseries();

            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('#datetime').datetimepicker('show');
            }, this));
        },

        update: function(){
            var units = this.$('#units').val();

            this.model.set('units', units);

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
            console.log('update ran');
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
                if(el[0] === entry[0] || el[0] === '2014-07-07T12:00:00'){
                    not_replaced = false;
                    array[index] = entry;
                }
            });

            if(not_replaced) {
                this.model.get('timeseries').push(entry);
            }

            dateObj.add('h', incrementer);
            this.$('#datetime').val(dateObj.format(webgnome.config.date_format.moment));

            this.renderTimeseries();
            this.update();
        },

        renderTimeseries: function(){
            this.model.sortTimeseries();

            var html = '';
            _.each(this.model.get('timeseries'), function(el, index){
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
        },

        editTimeseriesEntry: function(e){
            if (this.$('.input-amount').length <= 0){
                e.preventDefault();
                e.stopPropagation();
                var row = this.$(e.target).parents('tr')[0];
                var index = row.dataset.tsindex;
                var entry = this.model.get('timeseries')[index];
                var date = moment(entry[0]).format(webgnome.config.date_format.moment);
                var compiled = _.template(EditRowTemplate);
                var template = compiled({
                    date: date,
                    amount: entry[1][0]
                });
                this.$(row).addClass('edit');
                this.$(row).html(template);
            }
        },

        enterTimeseriesEntry: function(e){
            e.preventDefault();
            var row = this.$(e.target).parents('tr')[0];
            var index = row.dataset.tsindex;
            var entry = this.model.get('timeseries')[index];
            var amount = this.$('.input-amount').val();
            var date = entry[0];
            entry = [date, [amount]];
            _.each(this.model.get('timeseries'), _.bind(function(el, index, array){
                if (el[0] === entry[0]){
                    array[index] = entry;
                    this.timeseries = array;
                }
            }, this));
            this.$(row).removeClass('edit');
            this.renderTimeseries();
        },

        cancelTimeseriesEntry: function(e){
            e.preventDefault();
            var row = this.$(e.target).parents('tr')[0];
            var index = row.dataset.tsindex;
            var entry = this.model.get('timeseries')[index];
            this.renderTimeseries();
            this.$(row).removeClass('edit');
        },

        removeTimeseriesEntry: function(e){
            e.preventDefault();
            e.stopPropagation();
            var index = e.target.parentElement.parentElement.dataset.tsindex;
            this.model.get('timeseries').splice(index, 1);
            this.renderTimeseries();
        }

    });

    return beachedForm;
});