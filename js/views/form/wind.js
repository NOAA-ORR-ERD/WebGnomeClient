define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/modal/form',
    'text!templates/form/wind.html',
    'compassui',
    'jqueryDatetimepicker'
], function($, _, Backbone, moment, FormModal, FormTemplate){
    var windForm = FormModal.extend({
        className: 'modal fade form-modal wind-form',
        events: function(){
            return _.defaults({
                'shown.bs.modal': 'rendered',
                'shown.bs.tab': 'tabRendered',
                'click .add': 'addTimeseriesEntry',
                'click tr': 'modifyTimeseriesEntry',
                'click td span': 'removeTimeseriesEntry'
            }, FormModal.prototype.events);
        },

        initialize: function(options, GnomeWind){
            FormModal.prototype.initialize.call(this, options);
            this.model = GnomeWind;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                timeseries: this.model.get('timeseries').length === 0 ? [['', [0, 0]]] : this.model.get('timeseries'),
                unit: this.model.get('units')
            });
            
            FormModal.prototype.render.call(this, options);

            this.form.constant = [];
            this.form.constant['speed'] = this.$('#constant-speed');
            this.form.constant['direction'] = this.$('#constant-direction');
            this.form.variable = [];
            this.form.variable['speed'] = this.$('#variable-speed');
            this.form.variable['direction'] = this.$('#variable-direction');
            this.form.variable['datetime'] = this.$('#datetime');

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
            this.$('select[name="units"]').find('option[value="' + this.model.get('units') + '"]').attr('selected', 'selected');
            this.renderTimeseries();
        },

        rendered: function(){
            if(this.model.get('timeseries').length <= 1){
                this.$('.nav-tabs a[href="#constant"]').tab('show');
            } else {
                this.$('.nav-tabs a[href="#variable"]').tab('show');
            }
        },

        tabRendered: function(e){
            if(e.target.hash == '#constant'){
                if(this.$('.constant-compass canvas').length === 0){
                    this.$('.constant-compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.constantCompassUpdate, this)
                    });
                    this.$('.constant-compass').compassRoseUI('update', {
                        speed: this.form.constant['speed'].val(),
                        direction: this.form.constant['direction'].val()
                    });
                }
            } else if (e.target.hash == '#variable') {
                if(this.$('.variable-compass canvas').length === 0){
                    this.$('.variable-compass').compassRoseUI({
                        'arrow-direction': 'in',
                        'move': _.bind(this.variableCompassUpdate, this)
                    });
                }
                if(this.model.get('timeseries').length == 1){
                    this.model.set('timeseries', []);
                }
                this.renderTimeseries();
            }
        },

        update: function(compass){
            var active = this.$('.nav-tabs .active a').attr('href').replace('#', '');
            var speed = this.form[active]['speed'].val();
            var direction = this.form[active]['direction'].val();
            if(compass && speed !== '' && direction !== ''){
                this.$('.' + active + '-compass').compassRoseUI('update', {
                    speed: speed,
                    direction: direction
                });
            }

            if(active === 'constant'){
                // if the constant wind pain is active a timeseries needs to be generated for the values provided
                this.model.set('timeseries', [['2013-02-13T09:00:00', [speed, direction]]]);
            }

            this.model.set('units', this.$(active + ' select[name="units"]').val());
            
            if(!this.model.isValid()){
                this.error('Error!', this.model.validationError);
            } else {
                this.clearError();
            }
        },


        constantCompassUpdate: function(magnitude, direction){
            this.form.constant['speed'].val(parseInt(magnitude, 10));
            this.form.constant['direction'].val(parseInt(direction, 10));
            this.update(false);
        },

        variableCompassUpdate: function(magnitude, direction){
            this.form.variable['speed'].val(parseInt(magnitude, 10));
            this.form.variable['direction'].val(parseInt(direction, 10));
            this.update(false);
        },

        addTimeseriesEntry: function(e){
            e.preventDefault();
            var date = moment(this.form.variable['datetime'].val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');
            var speed = this.form.variable['speed'].val();
            var direction = this.form.variable['direction'].val();
            var entry = [date, [speed, direction]];

            if(this.variableFormValidation(entry)){
                var not_replaced = true;
                _.each(this.model.get('timeseries'), function(el, index, array){
                    if(el[0] === entry[0]){
                        not_replaced = false;
                        array[index] = entry;
                    }
                });

                if(not_replaced){
                    this.model.get('timeseries').push(entry);
                }
                this.renderTimeseries();
            }
        },

        modifyTimeseriesEntry: function(e){
            e.preventDefault();
            var index = e.target.parentElement.dataset.tsindex;
            var entry = this.model.get('timeseries')[index];
            this.form.variable['datetime'].val(moment(entry[0]).format('YYYY/M/D H:mm'));
            this.form.variable['speed'].val(entry[1][0]);
            this.form.variable['direction'].val(entry[1][1]);
            this.$('.variable-compass').compassRoseUI('update', {
                speed: entry[1][0],
                direction: entry[1][1]
            });
        },

        removeTimeseriesEntry: function(e){
            e.preventDefault();
            e.stopPropagation();
            var index = e.target.parentElement.parentElement.dataset.tsindex;
            this.model.get('timeseries').splice(index, 1);
            this.renderTimeseries();
        },

        renderTimeseries: function(){
            this.model.sortTimeseries();

            var html = '';
            _.each(this.model.get('timeseries'), function(el, index){
                var date = moment(el[0]).format('YYYY/M/D H:mm');
                html = html + '<tr data-tsindex="' + index + '"><td>' + date + '</td><td>' + el[1][0] + '</td><td>' + el[1][1] + '</td><td><span class="glyphicon glyphicon-trash"></span></td></tr>';
            });
            this.$('table tbody').html(html);
        },

        variableFormValidation: function(entry){
            var valid = true;
            if(!this.form.variable['datetime'].val() || !this.form.variable['speed'].val() || !this.form.variable['direction'].val()){
                valid = false;
            }
            

            return valid;
        },

        next: function(){
            $('.xdsoft_datetimepicker').remove();
            FormModal.prototype.next.call(this);
        },

        back: function(){
            $('.xdsoft_datetimepicker').remove();
            FormModal.prototype.back.call(this);
        },

        close: function(){
            $('.xdsoft_datetimepicker').remove();
            FormModal.prototype.close.call(this);
        },


    });

    return windForm;
});