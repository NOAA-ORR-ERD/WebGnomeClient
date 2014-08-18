define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/index.html',
    'views/wizard/new',
    'views/form/oilQuery/oilLib'
], function($, _, Backbone, IndexTemplate, NewWizardForm, OilLibForm){
    var indexView = Backbone.View.extend({
        className: 'container page home',

        initialize: function() {
            this.render();
        },

        events: {
            'click .location': 'chooseLocation',
            'click .build': 'buildModel',
            'click .load': 'loadModel',
            'click .resume': 'resumeModel',
            'click .oilLib': 'loadOilForm'
        },

        chooseLocation: function(event) {
            event.preventDefault();
            webgnome.router.navigate('locations', true);
        },

        buildModel: function(event) {
            event.preventDefault();

            new NewWizardForm();
        },

        loadModel: function(event) {
            event.preventDefault();
        },

        resumeModel: function(event) {
            event.preventDefault();
            webgnome.router.navigate('model', true);
        },

        render: function(){
            var compiled = _.template(IndexTemplate, {
                hasModel: webgnome.hasModel()
            });
            $('body').append(this.$el.append(compiled));
        },

        loadOilForm: function(event){
            event.preventDefault();
            new OilLibForm().render();
        }
    });
    return indexView;
});