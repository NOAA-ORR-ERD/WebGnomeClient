define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/instant.html',
    'model/spill',
    'jqueryDatetimepicker',
    'moment'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel){
    var instantSpillForm = FormModal.extend({
        title: 'Instantaneous Release',
        className: 'modal fade form-modal instantspill-form',

        initialize: function(options, spillModel){
            FormModal.prototype.initialize.call(this, options);
            this.model = spillModel;
        },

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        render: function(options){
            if (this.model.get('name') === 'Spill'){
                var spillsArray = webgnome.model.get('spills').models;
                for (var i = 0; i < spillsArray.length; i++){
                    console.log('loop run');
                    if (spillsArray[i].get('id') === this.model.get('id')){
                        var nameStr = 'Spill #' + (i + 1);
                        this.model.set('name', nameStr);
                        break;
                    }
                }
            }
            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                amount: this.model.get('amount'),
                time: moment(this.model.get('release').get('release_time')).format('lll')
            });
            FormModal.prototype.render.call(this, options);

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });

            this.$('.slider').slider({
                min: 0,
                max: 5,
                value: 0,
                create: _.bind(function(){
                    this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
                }, this),
                slide: _.bind(function(e, ui){
                    this.updateConstantSlide(ui);
                }, this)
            });
        },

        update: function(){
            var name = this.$('#name').val();
            this.model.set('name', name);
            if (name === 'Spill'){
                var spillsArray = webgnome.model.get('spills').models;
                for (var i = 0; i < spillsArray.length; i++){
                    if (spillsArray[i].get('id') === this.model.get('id')){
                        var nameStr = 'Spill #' + (i + 1);
                        this.model.set('name', nameStr);
                        break;
                    }
                }
            }
            var amount = parseInt(this.$('#amountreleased').val(), 10);
            var units = this.$('#units').val();
            var release = this.model.get('release');
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');

            release.set('release_time', releaseTime);
            release.set('end_release_time', releaseTime);
            this.model.set('name', name);
            this.model.set('release', release);
            this.model.set('units', units);
            this.model.set('amount', amount);
            this.updateConstantSlide();

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        updateConstantSlide: function(ui){
            var value;
            if(!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = this.$('.slider').slider('value');
            }
            if(this.model.get('amount')){
                var amount = this.model.get('amount');
                if(value === 0){
                    this.$('.tooltip-inner').text(amount);
                } else {
                    var bottom = amount - value;
                    if (bottom < 0) {
                        bottom = 0;
                    }
                    var top = parseInt(amount, 10) + parseInt(value, 10);
                    this.$('.tooltip-inner').text(bottom + ' - ' + top);
                }
            }
            
        }

    });

    return instantSpillForm;
});