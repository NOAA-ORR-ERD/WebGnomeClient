define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/form/environment.html'
], function($, _, Backbone, FormModal, FormTemplate){
    'use strict';
    var environmentForm = FormModal.extend({
        initialize: function(options, modal){
            FormModal.prototype.initialize.call(this, options);

            this.body = _.template(FormTemplate);

        }
    });

    return environmentForm;
});