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
            'click input[type="checkbox"]': 'updateModel',
            'change select': 'updateModel',
        }, BasePanel.prototype.events),

        render: function() {
            var model = webgnome.model;
            var duration = model.formatDuration();
            var output = (webgnome.model.get('outputters')
                          .findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'}));
                          
            var tz_offset = webgnome.model.get('timezone_offset');

            var compiled = _.template(ModelPanelTemplate)({
                name: model.get('name'),
                uncertain: model.get('uncertain'),
                include_uncertain_bounds: output.get('include_uncertain_bounds'),
                run_backwards: model.get('run_backwards'),
                start_time: moment(model.get('start_time'))
                                   .format(webgnome.config.date_format.moment),
                time_step: Math.abs(model.get('time_step')),
                duration: duration,
                tz_select: this.genTimeZoneSelect(),
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

        updateModel: function(e) {
            var thisName = this.$(e.currentTarget).attr('name');
            var thisValue = this.$(e.currentTarget).val();

            if (thisName === 'include_uncertain_bounds') {
                thisValue = e.currentTarget.checked;
                var output = (webgnome.model.get('outputters')
                              .findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'}));
                output.set('include_uncertain_bounds', thisValue);
            }

            var name = this.$('#name').val();
            webgnome.model.set('name', name);

            var start_time = moment(this.$('.datetime').val(),
                                    webgnome.config.date_format.moment);
            

            if (start_time.isAfter('1970-01-01')) {
                webgnome.model.set('start_time', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            } else {
                this.edit();
            }
            // use || 0 to handle NaN coming from parseInt
            // no negative values allowed
            var days = Math.abs(parseInt(this.$('#days').val(), 10) || 0);
            var hours = Math.abs(parseInt(this.$('#hours').val(), 10) || 0);
            if (days === 0 & hours === 0) {
                hours = 1;
                this.$('#hours').val(1);
            }
            
            var timeoffset = this.$('#timeoffset');
            
            var tz_offset = webgnome.model.get('timezone_offset')
            if (!_.isNull(timeoffset)){               
                tz_offset.offset = parseFloat(timeoffset.val());
                tz_offset.title = this.$('#timeoffset option:selected').text();
            } else {
                tz_offset.offset = null;
                tz_offset.title = 'No TimeZone Specified';
            }
            webgnome.model.set('timezone_offset', tz_offset);
            
            var duration = (((days * 24) + hours) * 60) * 60;

            webgnome.model.set('duration', duration);

            // no negative values allowed
            var time_step = Math.abs(parseInt(this.$('#time_step').val(), 10) || 1);
            time_step = time_step * 60;
            time_step = Math.min(Math.max(time_step, 60), duration);

            if (time_step <= 3600) {
                while (parseInt(3600/time_step,10) !== 3600/time_step) {
                    time_step = time_step - 1;
                }
            } else {
                while (parseInt(time_step/3600,10) !== time_step/3600) {
                    time_step = time_step - 1;
                }

            }

            webgnome.model.set('time_step', time_step);
            this.$('#time_step').val(time_step/60);

            var uncertain = this.$('#uncertain:checked').val();
            webgnome.model.set('uncertain', _.isUndefined(uncertain) ? false : true);

            //var run_backwards = this.$('#run_backwards:checked').val();
            //webgnome.model.set('run_backwards', _.isUndefined(run_backwards) ? false : run_backwards);
            var run_backwards = webgnome.model.get('run_backwards');
            if (run_backwards) {
                time_step = -time_step;
                duration = -duration;
                webgnome.model.set('duration', duration);
                webgnome.model.set('time_step', time_step);
            }

            webgnome.model.save(null, {
                validate: false
            });
        }
    });

    return modelPanel;
});
