define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'nucos',
    'sweetalert',
    'views/modal/form',
    'model/weatherers/manual_beaching',
    'text!templates/form/beached.html',
    'text!templates/form/beached/input-static.html',
    'text!templates/form/beached/input-edit.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, module, moment, nucos, swal,
            FormModal, BeachedModel,
            BeachedTemplate, StaticRowTemplate, EditRowTemplate) {
    'use strict';
    var beachedForm = FormModal.extend({
        className: 'modal form-modal model-form beached-form',
        title: 'Observed Beached Oil',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="delete">Delete</button><button type="button" class="save">Save</button>',

        events : function() {
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
                'click .undo': 'cancelTimeseriesEntry',
                'click .delete': 'deleteBeaching'
            }, formModalHash);
        },

        initialize: function(options, model) {
            this.module = module;

            FormModal.prototype.initialize.call(this, options);

            if (_.isUndefined(model)) {
                this.model = new BeachedModel();
            }
            else {
                this.model = model;
            }
        },

        render: function(options) {
            var units = this.model.get('units');

            // Check to see if spills exist and if beached time series is empty.
            // If so set the units of the beached amount to matched that of
            // spilled oil
            if (this.model.get('timeseries').length === 0 &&
                    webgnome.model.get('spills').length !== 0) {
                var spillUnits = webgnome.model.get('spills').at(0).get('units');
                this.model.set('units', spillUnits);
            }

            this.body = _.template(BeachedTemplate)();

            FormModal.prototype.render.call(this, options);

            this.$('#units option[value="' + units + '"]').prop('selected', 'selected');

            this.renderTimeseries();

            if (this.model.isNew()) {
                this.$('.delete').prop('disabled', true);
            }

            var start_time;

            if (this.model.get('timeseries').length === 0) {
                start_time = moment(webgnome.model.get('start_time')).add(webgnome.model.get('time_step'), 's');
            }
            else {
                start_time = moment(this.model.get('timeseries')[this.model.get('timeseries').length - 1][0]);
            }

            var initial_time = start_time.format(webgnome.config.date_format.moment);

            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });

            this.$('#datepick').on('click', _.bind(function() {
                this.$('#datetime').datetimepicker('show');
            }, this));

            this.$('#datetime').val(initial_time);
        },

        update: function() {
            var units = this.$('#units').val();

            this.model.set('units', units);
        },

        addBeachedAmount: function(e) {
            e.preventDefault();
            var dateObj = moment(this.$('#datetime').val(), webgnome.config.date_format.moment);
            var date = dateObj.format('YYYY-MM-DDTHH:mm:00');
            var amount = this.$('#beached-amount').val();

            var entry = [date, amount];
            var incrementer = parseInt(this.$('#incrementCount').val(), 10);
            var not_replaced = true;

            _.each(this.model.get('timeseries'), function(el, index, array) {
                if (el[0] === entry[0] || el[0] === '2014-07-07T12:00:00') {
                    not_replaced = false;
                    array[index] = entry;
                }
            });

            if (not_replaced) {
                this.model.get('timeseries').push(entry);
            }

            dateObj.add('h', incrementer);
            this.$('#datetime').val(dateObj.format(webgnome.config.date_format.moment));

            this.renderTimeseries();
            this.update();
        },

        renderTimeseries: function() {
            this.model.sortTimeseries();

            var html = '';

            _.each(this.model.get('timeseries'), function(el, index) {
                var beached = el[1];
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

        editTimeseriesEntry: function(e) {
            if (this.$('.input-amount').length <= 0) {
                e.preventDefault();
                e.stopPropagation();

                var row = this.$(e.target).parents('tr')[0];
                var index = this.$(row).data('tsindex');
                var entry = this.model.get('timeseries')[index];
                var date = moment(entry[0]).format(webgnome.config.date_format.moment);
                var compiled = _.template(EditRowTemplate);

                var template = compiled({
                    date: date,
                    amount: entry[1]
                });

                this.$(row).addClass('edit');
                this.$(row).html(template);

                this.$(row).find('.input-time').datetimepicker({
                    format: webgnome.config.date_format.datetimepicker,
                    allowTimes: webgnome.config.date_format.half_hour_times,
                    step: webgnome.config.date_format.time_step
                });
            }
        },

        enterTimeseriesEntry: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var row = this.$(e.target).parents('tr')[0];
            var index = this.$(row).data('tsindex');

            var date = moment(this.$('.input-time').val()).format('YYYY-MM-DDTHH:mm:00');
            var amount = this.$('.input-amount').val();

            var entry = [date, amount];

            var tsCopy = _.clone(this.model.get('timeseries'));
            _.each(tsCopy, _.bind(function(el, i, array) {
                if (index === i) {
                    array[i] = entry;
                }
            }, this));

            this.model.set('timeseries', tsCopy);
            this.$(row).removeClass('edit');
            this.renderTimeseries();
        },

        cancelTimeseriesEntry: function(e) {
            e.preventDefault();

            var row = this.$(e.target).parents('tr')[0];
            var index = $(row).data('tsindex');
            var entry = this.model.get('timeseries')[index];

            this.renderTimeseries();
            this.$(row).removeClass('edit');
        },

        removeTimeseriesEntry: function(e) {
            e.preventDefault();
            e.stopPropagation();

            var index = $(e.target.parentElement.parentElement).data('tsindex');

            this.model.get('timeseries').splice(index, 1);
            this.renderTimeseries();
        },

        deleteBeaching: function() {
            var id = this.model.get('id');

            swal({
                title: "Are you sure?",
                text: "This will delete the beaching weatherer from the model.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            }).then(_.bind(function(isConfirm) {
                webgnome.model.get('weatherers').remove(id);
                webgnome.model.save();

                this.on('hidden', _.bind(function() {
                    this.trigger('wizardclose');
                }, this));

                this.hide();
            }, this));
        },

        save: function() {
            if (this.model.get('timeseries').length === 0) {
                webgnome.model.get('weatherers').remove(this.model.get('id'));
                webgnome.model.save(null, {validate: false});
                this.close();
            }
            else {
                if (this.model.get('timeseries').length === 1) {
                    var timeseries = this.model.get('timeseries');

                    var startTime = this.model.get('active_range')[0];
                    var stopTime = timeseries[0][0];

                    this.model.set('active_range', [startTime, stopTime]);
                }

                FormModal.prototype.save.call(this);
            }
        },

        close: function() {
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }

    });

    return beachedForm;
});
