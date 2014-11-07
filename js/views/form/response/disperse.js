define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/response/disperse.html',
    'model/weatherers/dispersion',
    'moment',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, DisperseModel, moment){
    var disperseForm = FormModal.extend({
        title: 'Disperse Response',
        className: 'modal fade form-modal disperse-form',

        initialize: function(options, disperseModel){
            FormModal.prototype.initialize.call(this, options, disperseModel);
            this.model = disperseModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate,{
                time: moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: 4
            });
            FormModal.prototype.render.call(this, options);
            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
        }
    });

    return disperseForm;
});