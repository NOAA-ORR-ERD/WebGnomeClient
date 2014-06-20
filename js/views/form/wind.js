define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/wind.html',
    'compassui'
], function($, _, Backbone, FormModal, FormTemplate){
    var windForm = FormModal.extend({
        className: 'modal fade form-modal wind-form',
        events: function(){
            return _.defaults({
                'shown.bs.modal': 'rendered',
                'shown.bs.tab': 'tab_rendered'
            }, FormModal.prototype.events);
        },

        initialize: function(options, GnomeWind){
            FormModal.prototype.initialize.call(this, options);
            this.model = GnomeWind;
            this.body = _.template(FormTemplate, {
                speed: '',
                direction: ''
            });
        },

        rendered: function(){
            this.$('#direction').tooltip({trigger: 'focus'});

            this.form['speed'] = this.$('#speed');
            this.form['direction'] = this.$('#direction');
            this.$('.nav-tabs li:first a').tab('show');
        },

        tab_rendered: function(e){
            if(e.target.hash == '#constant'){

                if(this.$('.compass canvas').length === 0){
                    this.$('.compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.compassUpdate, this)
                    });
                }
            }
        },

        update: function(compass){
            if(compass && this.form['speed'].val() !== '' && this.form['direction'].val() !== ''){
                console.log({
                    magnitude: this.form['speed'].val(),
                    direction: this.form['direction'].val().replace('°', '')
                });
                this.$('.compass').compassRoseUI('update', {
                    magnitude: parseInt(this.form['speed'].val()),
                    direction: parseInt(this.form['direction'].val().replace('°', ''))
                });
            }

            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },

        compassUpdate: function(magnitude, direction){
            this.form['speed'].val(parseInt(magnitude, 10));
            this.form['direction'].val(parseInt(direction, 10) + '°');
            this.update(false);
        }
    });

    return windForm;
});