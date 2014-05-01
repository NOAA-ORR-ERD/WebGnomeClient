define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'lib/text!templates/form/environment.html'
], function($, _, Backbone, FormModal, FormTemplate){
    var environmentForm = FormModal.extend({
        initialize: function(options, modal){
            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(FormTemplate);

            this.render();
        }
    });

    return environmentForm;
});