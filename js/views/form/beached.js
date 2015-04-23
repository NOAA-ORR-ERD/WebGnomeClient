define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/beached.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, FormModal, BeachedTemplate){
    var beachedForm = FormModal.extend({
        className: 'modal fade form-modal model-form',
        title: 'Beached Oil',

        events : function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, model){
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(BeachedTemplate, {});

            FormModal.prototype.render.call(this, options);
        },

        update: function(){

        }

    });

    return beachedForm;
});