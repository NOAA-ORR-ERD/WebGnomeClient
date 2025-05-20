define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'text!templates/form/mover/edit.html',
    'views/modal/form',
], function($, _, module, moment, FormTemplate, FormModal) {
    'use strict';
    var griddedWindEditForm = FormModal.extend({

        className: 'modal form-modal griddedwind-form',
        title: 'Gridded Wind',
        buttons: '<button type="button" class="cancel">Cancel</button>' +
                 '<button type="button" class="save">Save</button>',

        initialize: function(options, model) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = model;
        },

        render: function(options) {
            
            var extrapolation_allowed = this.model.get('wind').get('extrapolation_is_allowed');
            var start_time = this.model.get('wind').get('data_start');
            var end_time = this.model.get('wind').get('data_stop');
            var active_range = this.model.get('active_range');
            var mover_time_offset = this.model.get('wind').get('timezone_offset');
            
            this.model.set('new_data_start', start_time);
            this.model.set('new_data_stop', end_time);
            
            var model_time_offset = webgnome.model.get('timezone_offset'); 
            var adjust_tz_checked = true; 
            
            if (_.isNull(model_time_offset.get('offset'))) {
                adjust_tz_checked = false;
            }
            
            this.body = _.template(FormTemplate)({
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('scale_value'),
                extrapolation_is_allowed: extrapolation_allowed,
                start_time: start_time,
                end_time: end_time,
                mover_tzone: mover_time_offset.get('title').split('[')[0], 
                model_tzone: model_time_offset.get('title').split('[')[0],
                active_start: active_range[0],
                active_stop: active_range[1],
                adjust_tz_checked: adjust_tz_checked,
                tz_select: this.genTimeZoneSelect(),
                show_adjust_tz: true,
            });

            FormModal.prototype.render.call(this);
            
            if (!_.isNull(model_time_offset.get('offset'))) {
                if (mover_time_offset.get('offset') !== model_time_offset.get('offset')) {
                    var timeoffset_name = model_time_offset.get('title');
                    var timeoffset = model_time_offset.get('offset');
                    this.updateStartEndTimes(timeoffset-mover_time_offset.get('offset'),timeoffset_name.split('[')[0]);
                }
            }
            
            this.$('#active_start, #active_stop').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
            
            if (JSON.stringify(active_range) === JSON.stringify(["-inf","inf"])) {
                this.$('#set_active_range').val("infinite");              
            } else {
                this.$('#set_active_range').val("data_range");
                this.$(".active_range").removeClass("hide");
            }
        },
        
        update: function(e) {
            
            var event_name = e.currentTarget.id;
            
            if (event_name === 'set_active_range') {
                this.showActiveRange(e);
            } else if (event_name === 'extrapolation-allowed') {
                this.setExtrapolation($(e.target).is(':checked'));
            } else 
            if (event_name === 'timeoffset') {
                this.updateStartEndTimes();
                this.showActiveRange(e);
            }
                 
            var name = this.$('#mover_name').val();
            this.model.set('name', name);
            this.model.get('wind').set('name', name);
            
            var scale_value = this.$('#scale_value').val();
            this.model.set('scale_value', scale_value);
            
            FormModal.prototype.update.call(this);
            
        },

        setExtrapolation: function(selected) {

            this.model.get('wind').set('extrapolation_is_allowed', selected);
        },
        
        applyOffset: function() {
            
            var selected = this.$('#adjust_tz_to_model').is(':checked');
                      
            var timeoffset = parseFloat(this.$('#timeoffset').val());
            var timeoffset_name = this.$('#timeoffset option:selected').text();
            var model_time_offset = webgnome.model.get('timezone_offset');
            var mover_time_offset = this.model.get('wind').get('timezone_offset');  
            if (timeoffset !== mover_time_offset.get('offset') && selected) {
                mover_time_offset.set('offset', timeoffset);
                mover_time_offset.set('title', timeoffset_name);                    
            }
            if (timeoffset !== model_time_offset.get('offset')) {
                model_time_offset.set('offset', timeoffset);
                model_time_offset.set('title', timeoffset_name);
            }
        },
        
        updateStartEndTimes: function() {

            var selected = this.$('#adjust_tz_to_model').is(':checked');

            var timeoffset = parseFloat(this.$('#timeoffset').val());
            var timeoffset_name = this.$('#timeoffset option:selected').text();
            var mover_time_offset = this.model.get('wind').get('timezone_offset');
            var old_timeoffset = parseFloat(mover_time_offset.get('offset'));

            var offset = timeoffset-old_timeoffset;
            var title = timeoffset_name.split('[')[0];

            var data_start = this.model.get('wind').get('data_start');
            var data_stop = this.model.get('wind').get('data_stop');
            var new_start = moment(data_start).add(offset,'hour').format("YYYY-MM-DDTHH:mm:ss");
            var new_stop = moment(data_stop).add(offset,'hour').format("YYYY-MM-DDTHH:mm:ss");

            this.$('#new_time_zone').html('<strong>[' + title + ']</strong>');    
            this.$('#new_start_time').html(new_start);
            this.$('#new_end_time').html(new_stop);

            if (selected) {
                this.$('#adjust_tz').removeClass('hide');
                this.model.set('new_data_start', new_start);
                this.model.set('new_data_stop', new_stop);
            } else {
                this.$('#adjust_tz').addClass('hide');
            }

            this.$('#active_start').val(new_start);
            this.$('#active_stop').val(new_stop);
            
        },
        
        showActiveRange: function(e) {
            
            var value = e.currentTarget.value;
            
            if (value !== 'infinite') {
                this.$(e.currentTarget).parent().siblings('.hide').removeClass('hide');
                this.model.set('active_range',[this.model.get('new_data_start'),this.model.get('new_data_stop')]);
            } else {
                this.$(e.currentTarget).parent().siblings('.active_range').addClass('hide');
                this.model.set('active_range',["-inf","inf"]);
            }
            
            this.$('#active_start').val(this.model.get('active_range')[0]);
            this.$('#active_stop').val(this.model.get('active_range')[1]);
        },
        
        wizardclose: function() {
            webgnome.model.fetch();
            FormModal.prototype.wizardclose.call(this);
        },
        
        save: function() {
            this.applyOffset(); 
            FormModal.prototype.save.call(this);
        },
        
    });

    return griddedWindEditForm;
});