define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'lib/text!templates/form/spill.html'
], function($, _, Backbone, FormModal, FormTemplate){
    var spillForm = FormModal.extend({
        name: 'spill',
        title: 'Spill',
        
        initialize: function(options, model){
            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(FormTemplate);

            this.render();
        }
    });

    return spillForm;
});