define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'ol',
    'views/modal/form',
    'text!templates/form/spill-form.html',
], function($, _, Backbone, moment, ol, FormModal, SpillTemplate) {
    var spillForm = FormModal.extend({
        className: 'modal fade form-modal spill-form',
        name: 'spill',
        title: 'Spill',

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);

            this.model = (model ? model : null);
        },

        render: function(options){
            var spill = this.model;
            this.body = _.template(SpillTemplate, {
                start_lat: spill.get('release').get('start_position')[1],
                start_lng: spill.get('release').get('start_position')[0],
                end_lat: spill.get('release').get('end_position')[1],
                end_lng: spill.get('release').get('end_position')[0],
                name: spill.get('name'),
                release_amount: spill.get('release-amount'),
                release_start: _.isNull(spill.get('release').get('release_time')) ? moment().format('YYYY/M/D H:mm') : moment(spill.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                release_end: _.isNull(spill.get('release').get('end_release_time')) ? moment().format('YYYY/M/D H:mm') : moment(spill.get('release').get('end_release_time')).format('YYYY/M/D H:mm')
            });

            FormModal.prototype.render.call(this, options);

            this.$('#release-start').datetimepicker({
                format: 'Y/n/j G:i',
            });
            this.$('#release-end').datetimepicker({
                format: 'Y/n/j G:i',
            });

            // set the correct select input on the forms
            if(!_.isUndefined(spill.get('pollutant'))){
                this.$('#pollutant').find('option[value="' + spill.get('pollutant') + '"]').attr('selected', 'selected');
            }
            if(!_.isUndefined(spill.get('release-unit'))){
                this.$('#release-unit').find('option[value="' + spill.get('release-unit') + '"]').attr('selected', 'selected');
            }
        },

        update: function(){
            var spill = this.spill;
            var release = spill.get('release');

            spill.set('name', this.$('#name').val());

            // if this is a point update the end position to be the same as the start position
            release.set('start_position', [parseFloat(this.$('#start-lng').val()), parseFloat(this.$('#start-lat').val())]);
            release.set('end_position', [parseFloat(this.$('#start-lng').val()), parseFloat(this.$('#start-lat').val())]);
            this.$('#end-lng').val(spill.get('release').get('start_position')[0]);
            this.$('#end-lat').val(spill.get('release').get('start_position')[1]);
            
            spill.set('pollutant', this.$('#pollutant').val());
            spill.set('release-amount', this.$('#release-amount').val());
            spill.set('release-unit', this.$('#release-unit').val());
            var release_start = $('#release-start').val();
            var release_end = $('#release-end').val();
            release.set('release_time', moment(release_start, 'YYYY/M/D H:mm').format());
            release.set('end_release_time', moment(release_end, 'YYYY/M/D H:mm').format());

            if(!spill.isValid()){
                this.error('Error!', spill.validationError);
            } else {
                this.clearError();
            }
        },

        save: function(){
            FormModal.prototype.save.call(this, function(){
                $('.xdsoft_datetimepicker').remove();
            });
        },

        close: function(){
            $('.xdsoft_datetimepicker').remove();
            FormModal.prototype.close.call(this);
        }
    });

    return spillForm;
});