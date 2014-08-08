define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'jqueryui/core',
    'views/modal/form',
    'text!templates/form/oilLib.html'
], function($, _, Backbone, chosen, jqueryui, FormModal, OilTemplate){
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
            this.$('.chosen-select').chosen({width: '350px'});
            this.$('.slider').slider({range: true, min: -2, max: 180});
            this.$('.slider').slider('values', 0, -2);
            this.$('.slider').slider('values', 1, 180);
        }
    });

    return oilLibForm;
});