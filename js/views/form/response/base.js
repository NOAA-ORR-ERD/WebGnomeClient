define([
	'jquery',
	'underscore',
	'backbone',
	'views/modal/form',
	'moment',
	'jqueryDatetimepicker',
    'jqueryui/slider'
], function($, _, Backbone, FormModal, moment){
	var baseResponseForm = FormModal.extend({

        events: function(){
            return _.defaults({
                'click .slidertoggle': 'toggleEfficiencySlider'
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
                format: 'Y/n/j G:i',
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('#datetime').datetimepicker('show');
            }, this));

            this.$('.slider').slider({
                min: 0,
                max: 100,
                value: 20,
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

            if (!this.model.get('efficiency')){
                this.$('.slidertoggle')[0].checked = true;
                this.toggleEfficiencySlider();
            }

            this.updateEfficiency();
            this.setEfficiencySlider();
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
                value = this.model.get('efficiency') * 100;
            } else {
                value = this.$('.slider').slider('value');
            }
            this.$('#rate-tooltip').text(value);
            this.updateTooltipWidth();
            this.model.set('efficiency', parseFloat(value) / 100);
        },

        toggleEfficiencySlider: function(){
            if (this.$('.slidertoggle').is(':checked')){
                this.$('.slider').slider({disabled: true});
                this.model.set('efficiency', null);
            } else {
                this.$('.slider').slider({disabled: false});
                this.model.set('efficiency', parseFloat(this.$('.slider').slider('value')) / 100);
            }
        },

        setEfficiencySlider: function(){
            if (!_.isNull(this.model.get('efficiency'))){
                var val = this.model.get('efficiency') * 100;
                this.$('.slider').slider('value', val);
                this.$('#rate-tooltip').text(val);
            } else {
                this.$('.slidertoggle').prop('checked', true);
                this.toggleEfficiencySlider();
            }
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }
	});

	return baseResponseForm;
});