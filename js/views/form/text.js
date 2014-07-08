define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
], function($, _, Backbone, FormModal){
    var textForm = FormModal.extend({
        initialize: function(options, modal){
            FormModal.prototype.initialize.call(this, options);
        }
    });

    return textForm;
});