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
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            if (!_.isUndefined(options.model)){
                this.model = options.model;
            } else {
                this.model = spillModel;
            }
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

            var startPosition = this.model.get('release').get('start_position');

            this.body = _.template(FormTemplate, {
                name: this.model.get('name'),
                amount: this.model.get('amount'),
                time: _.isNull(this.model.get('release').get('release_time')) ? moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                coords: {'lat': startPosition[1], 'lon': startPosition[0]}
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
            var amount = parseInt(this.$('#spill-amount').val(), 10);
            var units = this.$('#units').val();
            var release = this.model.get('release');
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');
            var latitude = this.$('#latitude').val() ? this.$('#latitude').val() : '0';
            var longitude = this.$('#longitude').val() ? this.$('#longitude').val() : '0';

            if (latitude.indexOf('°') !== -1){
                latitude = geolib.sexagesimal2decimal(latitude);
            }

            if (longitude.indexOf('°') !== -1){
                longitude = geolib.sexagesimal2decimal(longitude);
            }

            if (!_.isUndefined(this.spillCoords)){
                this.$('#latitude').val(this.spillCoords.lat);
                this.$('#longitude').val(this.spillCoords.lon);
                latitude = this.spillCoords.lat;
                longitude = this.spillCoords.lon;
            }

            var start_position = [parseFloat(longitude), parseFloat(latitude), 0];

            release.set('start_position', start_position);
            this.model.set('name', name);
            this.model.set('release', release);
            this.model.set('units', units);
            this.model.set('amount', amount);
            release.set('release_time', releaseTime);
            release.set('end_release_time', releaseTime);
            BaseSpillForm.prototype.update.call(this);
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