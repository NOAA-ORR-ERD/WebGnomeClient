define([
    'underscore',
    'jquery',
    'backbone',
    'sweetalert',
    'moment',
    'text!templates/panel/model.html',
    'views/panel/base',
    'views/form/model',
], function(_, $, Backbone, swal, moment,
            ModelPanelTemplate, BasePanel, ModelFormView) {
    'use strict';
    var modelPanel = BasePanel.extend({
        className: 'col-md-6 model object complete panel-view',

        events: _.defaults({
            'blur input': 'updateModel',
            'click input[type="checkbox"]': 'updateModel'
        }, BasePanel.prototype.events),

        render: function() {
            var model = webgnome.model;
            var duration = model.formatDuration();

            var compiled = _.template(ModelPanelTemplate, {
                name: model.get('name'),
                uncertain: model.get('uncertain'),
                start_time: moment(model.get('start_time'))
                                   .format(webgnome.config.date_format.moment),
                time_step: model.get('time_step'),
                duration: duration
            });

            this.$el.html(compiled);
            this.$('.panel').addClass('complete');
            this.$('.panel-body').show();

            if ($('.modal').length === 0) {
                $('.xdsoft_datetimepicker:last').remove();
            }

            BasePanel.prototype.render.call(this);


            this.$('.datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step,
                minDate:  "1970/01/01",
                yearStart: "1970",
            });

            this.$('#datepick').on('click', _.bind(function() {
                this.$('.datetime').datetimepicker('show');
            }, this));

            var delay = {
                show: 500,
                hide: 100
            };

            this.$('.panel-heading .advanced-edit').tooltip({
                title: 'Advanced Edit',
                delay: delay,
                container: 'body'
            });
        },

        edit: function(e) {
            var form = new ModelFormView(null, webgnome.model);

            form.on('wizardclose', _.bind(this.render, this));
            form.on('wizardclose', form.close);

            form.on('save', _.bind(function(){
                webgnome.model.save(null, {validate: false});
                form.on('hidden', form.close);
            }, this));

            form.render();
        },

        updateModel: function() {
            var name = this.$('#name').val();
            webgnome.model.set('name', name);

            var start_time = moment(this.$('.datetime').val(),
                                    webgnome.config.date_format.moment);
            if (start_time.isAfter('1970-01-01')) {
                webgnome.model.set('start_time', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            } else {
                this.edit();
            }

            var days = parseInt(this.$('#days').val(), 10);
            var hours = parseInt(this.$('#hours').val(), 10);
            if (days === 0 & hours === 0) {
                hours = 1;
                this.$('#hours').val(1);
            }
            var duration = (((days * 24) + hours) * 60) * 60;

            webgnome.model.set('duration', duration);

            var time_step = this.$('#time_step').val();
            time_step = Math.min(Math.max(time_step, 1), duration);
            webgnome.model.set('time_step', time_step);

            var uncertain = this.$('#uncertain:checked').val();
            webgnome.model.set('uncertain', _.isUndefined(uncertain) ? false : true);

            webgnome.model.save(null, {
                validate: false
            });
        }
    });

    return modelPanel;
});
