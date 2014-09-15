define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/continue.html',
    'model/spill',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel){
    var continueSpillForm = FormModal.extend({
        title: 'Continuous Release',
        className: 'modal fade form-modal spilltype-form',

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        render: function(options){
            this.body = _.template(FormTemplate);
            FormModal.prototype.render.call(this, options);

            this.$('#datetime').datetimepicker({
                format: 'Y/n/j G:i',
            });
        }

    });

    return continueSpillForm;
});