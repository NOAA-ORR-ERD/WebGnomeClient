define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'views/modal/form',
    'text!templates/form/oilLib.html'
], function($, _, Backbone, chosen, FormModal, OilTemplate){
    var oilLibForm = FormModal.extend({
        name: 'oillib',
        title: 'Oil Query Form',
        
        initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(OilTemplate);
            var chosen = jQuery.fn.chosen;
            FormModal.prototype.render.call(this, options);
            this.$('.chosen-select').chosen();
        }
    });

    return oilLibForm;
});