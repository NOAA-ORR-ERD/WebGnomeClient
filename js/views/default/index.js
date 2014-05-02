define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/default/index.html',
    'views/wizard/new'
], function($, _, Backbone, IndexTemplate, NewWizardForm){
    var indexView = Backbone.View.extend({
        className: 'container page home',

        initialize: function() {
            this.render();
        },

        events: {
            'click .location': 'chooseLocation',
            'click .build': 'buildModel',
            'click .load': 'loadModel'
        },

        chooseLocation: function(event) {
            event.preventDefault();
            webgnome.router.navigate('locations', true);
        },

        buildModel: function(event) {
            event.preventDefault();

            new NewWizardForm();

            // webgnome.model = new Model();
            // webgnome.model.fetch();
            // webgnome.router.navigate('model', true);
        },

        loadModel: function(event) {
            event.preventDefault();
        },

        render: function(){
            var compiled = _.template(IndexTemplate);
            $('body').append(this.$el.append(compiled));
        }
    });
    return indexView;
});