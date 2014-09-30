define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/instant.html',
    'model/spill',
    'views/form/oil/library',
    'views/default/map',
    'geolib',
    'jqueryDatetimepicker',
    'moment'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel, OilLibraryView, SpillMapView, geolib){
    var baseSpillForm = FormModal.extend({

        events: function(){
            return _.defaults({
                'click .oilSelect': 'elementSelect',
                'click .locationSelect': 'locationSelect'
            }, FormModal.prototype.events);
        },

        initialize: function(options, spillModel){
            FormModal.prototype.initialize.call(this, options);
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
            FormModal.prototype.render.call(this, options);

            this.$('#map').hide();

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
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
            var start_position = [parseFloat(longitude), parseFloat(latitude), 0];

            release.set('start_position', start_position);
            this.model.set('name', name);
            this.model.set('release', release);
            this.model.set('units', units);
            this.model.set('amount', amount);

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        elementSelect: function(){
            FormModal.prototype.hide.call(this);
            var oilLibraryView = new OilLibraryView();
            oilLibraryView.render();
            oilLibraryView.on('save', _.bind(function(){
                this.render();
                this.delegateEvents();
                this.on('save', _.bind(function(){
                    webgnome.model.get('spills').add(this.model);
                    webgnome.model.save();
                }, this));
            }, this));
        },

        locationSelect: function(){
            this.$('#map').show();
            setTimeout(function(){
                this.spillMapView = new SpillMapView();
                this.spillMapView.render();
            }, 1);
        },

        next: function(){
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.next.call(this);
        },

        back: function(){
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.back.call(this);
        },

        close: function(){
            $('.xdsoft_datetimepicker:last').remove();
            FormModal.prototype.close.call(this);
        }

    });

    return baseSpillForm;
});