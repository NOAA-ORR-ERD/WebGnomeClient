define([
	'jquery',
	'underscore',
	'backbone',
	'moment',
    'sweetalert',
	'views/form/response/base',
	'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, Backbone, moment, swal, BaseResponseForm) {
    'use strict';
	var baseAdiosResponseForm = BaseResponseForm.extend({
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="delete">Delete</button><button type="button" class="save">Save</button>',

        initialize: function(options, responseModel) {
            BaseResponseForm.prototype.initialize.call(this, options);

            if (!_.isUndefined(options.model)) {
                this.model = options.model;
            }
            else {
                this.model = responseModel;
            }
        },

        render: function(options) {
            BaseResponseForm.prototype.render.call(this, options);

            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });

            this.$('#datepick').on('click', _.bind(function() {
                this.$('#datetime').datetimepicker('show');
            }, this));

            var value;
            var commonWeatherers = webgnome.model.get('weatherers').where({'obj_type': this.model.get('obj_type')});

            if (commonWeatherers.length > 0) {
                value = commonWeatherers[0].get('efficiency');
                this.model.set('efficiency', value);
                value *= 100;
            }
            else {
                value = 20;
            }

            if (this.model.isNew()) {
                this.$('.delete').prop('disabled', true);
            }

            this.$('.slider').slider({
                min: 0,
                max: 100,
                value: value,
                create: _.bind(function(e, ui) {
                    this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="rate-tooltip" class="tooltip-inner">' + ui.value + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui) {
                    this.updateEfficiency(ui);
                }, this),
                stop: _.bind(function(e, ui) {
                    this.update();
                }, this)
            });

            if (this.model.get('efficiency') === 0.20) {
                //this.$('.slidertoggle')[0].checked = true;
                //this.toggleEfficiencySlider();
            }

            this.updateEfficiency();
        },

        update: function() {
            var name = this.$('#name').val();

            this.model.set('name', name);

            this.startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');

            this.model.set('active_range',
                           [this.startTime.format('YYYY-MM-DDTHH:mm:ss'),
                            'inf']);
        },

        parseDuration: function(start, end) {
            var duration = (moment(end).unix() - moment(start).unix()) * 1000;
            var hours = 0;

            if (!_.isUndefined(duration)) {
                hours = moment.duration(duration).asHours();
            }

            return hours;
        },

        updateEfficiency: function(ui) {
            var value;

            if (!_.isUndefined(ui)) {
                value = ui.value;
            }
            else if (!_.isNull(this.model.get('efficiency'))){
                value = parseInt(this.model.get('efficiency') * 100, 10);
            }
            else {
                value = this.$('.slider').slider('value');
            }

            this.$('#rate-tooltip').text(value);
            this.updateTooltipWidth();
            this.model.set('efficiency', value / 100);
        },

        close: function() {
            $('.xdsoft_datetimepicker:last').remove();
            BaseResponseForm.prototype.close.call(this);
        }
	});

	return baseAdiosResponseForm;
});
