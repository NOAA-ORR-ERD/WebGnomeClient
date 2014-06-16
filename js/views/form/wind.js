define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
], function($, _, Backbone, FormModal){
    var windForm = FormModal.extend({
        initialize: function(options, wind){
            FormModal.prototype.initialize.call(this, options);
        }
    });

    return windForm;
});