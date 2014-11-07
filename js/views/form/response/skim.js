define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/response/skim.html',
    'model/weatherers/skim',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, SkimModel){
    var skimForm = FormModal.extend({
        title: 'Skim Response',
        className: 'modal fade form-modal skim-form',

        initialize: function(options, skimModel){
            FormModal.prototype.initialize.call(this, options, skimModel);
            this.model = skimModel;
        },

        render: function(options){
            this.body = _.template(FormTemplate, {
                time: 5,
                duration: 4
            });
            FormModal.prototype.render.call(this, options);
            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
        }
    });

    return skimForm;
});