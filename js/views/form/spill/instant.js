define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/spill/base',
    'text!templates/form/spill/instant.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'geolib',
    'jqueryDatetimepicker',
    'moment'
], function($, _, Backbone, BaseSpillForm, FormTemplate, SpillModel, OilLibraryView, SpillMapView, geolib){
    var instantSpillForm = BaseSpillForm.extend({
        title: 'Instantaneous Release',
        className: 'modal fade form-modal instantspill-form',

        initialize: function(options, spillModel){
            BaseSpillForm.prototype.initialize.call(this, options);
            if (!_.isUndefined(options.model)){
                this.model = options.model;
            } else {
                this.model = spillModel;
            }
        },

        events: function(){
            return _.defaults(BaseSpillForm.prototype.events());
        },

        render: function(options){
            if (this.model.get('name') === 'Spill'){
                var spillsArray = webgnome.model.get('spills').models;
                for (var i = 0; i < spillsArray.length; i++){
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
                time: moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm')
            });
            BaseSpillForm.prototype.render.call(this, options);

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
            // if (name === 'Spill'){
            //     var spillsArray = webgnome.model.get('spills').models;
            //     for (var i = 0; i < spillsArray.length; i++){
            //         if (spillsArray[i].get('id') === this.model.get('id')){
            //             var nameStr = 'Spill #' + (i + 1);
            //             this.model.set('name', nameStr);
            //             break;
            //         }
            //     }
            // }
            var amount = parseInt(this.$('#amountreleased').val(), 10);
            var units = this.$('#units').val();
            var release = this.model.get('release');
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');
            var latitude = this.$('#latitude').val();
            var longitude = this.$('#longitude').val();

            BaseSpillForm.prototype.update.call(this);

            release.set('release_time', releaseTime);
            release.set('end_release_time', releaseTime);
            this.updateConstantSlide();
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