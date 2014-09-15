define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/spill/instant.html',
    'model/spill',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, FormTemplate, SpillModel){
    var instantSpillForm = FormModal.extend({
        title: 'Instantaneous Release',
        className: 'modal fade form-modal spilltype-form',

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        render: function(options){
            this.body = _.template(FormTemplate);
            FormModal.prototype.render.call(this, options);
        }

    });

    return instantSpillForm;
});