define([
	'jquery',
	'underscore',
	'backbone',
	'views/modal/form',
	'moment',
    'sweetalert',
	'jqueryDatetimepicker',
    'jqueryui/slider'
], function($, _, Backbone, FormModal, moment, swal){
    'use strict';
	var baseResponseForm = FormModal.extend({
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="delete">Delete</button><button type="button" class="save">Save</button>',
        events: function(){
            return _.defaults({
                'click .delete': 'deleteResponse'
            }, FormModal.prototype.events);
        },

        initialize: function(options, responseModel){
            FormModal.prototype.initialize.call(this, options);
            if (!_.isUndefined(options.model)){
                this.model = options.model;
            } else {
                this.model = responseModel;
            }
            this.nameCounter(this.model);
        },

        render: function(options){
            FormModal.prototype.render.call(this, options);
            this.$('#datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('#datetime').datetimepicker('show');
            }, this));

            var value;
            var commonWeatherers = webgnome.model.get('weatherers').where({'obj_type': this.model.get('obj_type')});
            if (commonWeatherers.length > 0){
                value = commonWeatherers[0].get('efficiency');
                this.model.set('efficiency', value);
                value *= 100;
            } else {
                value = 20;
            }

            this.$('.slider').slider({
                min: 0,
                max: 100,
                value: value,
                create: _.bind(function(e, ui){
                    this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="rate-tooltip" class="tooltip-inner">' + ui.value + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateEfficiency(ui);
                }, this),
                stop: _.bind(function(e, ui){
                    this.update();
                }, this)
            });

            if (this.model.get('efficiency') === 0.20){
                //this.$('.slidertoggle')[0].checked = true;
                //this.toggleEfficiencySlider();
            }

            this.updateEfficiency();
            //this.setEfficiencySlider();
        },

        update: function(){
            var name = this.$('#name').val();
            this.startTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var start_time = this.startTime;
            this.model.set('name', name);
            this.model.set('active_start', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        parseDuration: function(start, end){
            var duration = (moment(end).unix() - moment(start).unix()) * 1000;
            var hours = 0;
            if (!_.isUndefined(duration)){
                hours = moment.duration(duration).asHours();
            }
            return hours;
        },

        nameCounter: function(responseModel){
            var responses = webgnome.model.get('weatherers').models;
            var responseName = responseModel.get('name');
            var nameCount = 1;
            var responseNameArray = ["Burn", "Skimmer", "Dispersion"];
            if (responseNameArray.indexOf(responseName) > -1){
                for (var i = 0; i < responses.length; i++){
                    if (responses[i].get('name').split(" ")[0] === responseName){
                        nameCount++;
                    }
                }
                this.model.set('name', responseName + " #" + nameCount);
            }
        },

        updateEfficiency: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else if (!_.isNull(this.model.get('efficiency'))){
                value = parseInt(this.model.get('efficiency') * 100, 10);
            } else {
                value = this.$('.slider').slider('value');
            }
            this.$('#rate-tooltip').text(value);
            this.updateTooltipWidth();
            this.model.set('efficiency', value / 100);
        },

        deleteResponse: function(){
            var id = this.model.get('id');
            swal({
                title: 'Delete "' + this.model.get('name') + '"',
                text: 'Are you sure you want to delete this response?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }, _.bind(function(isConfirmed){
                if(isConfirmed){
                    webgnome.model.get('weatherers').remove(id);
                    webgnome.model.save();
                    this.on('hidden', _.bind(function(){
                        this.trigger('wizardclose');
                    }, this));
                    this.hide();
                }
            }, this));
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }
	});

	return baseResponseForm;
});