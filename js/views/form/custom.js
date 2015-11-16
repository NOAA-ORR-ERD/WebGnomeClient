define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
], function($, _, Backbone, FormModal){
    'use strict';
    var customForm = FormModal.extend({
        initialize: function(options, modal){
            FormModal.prototype.initialize.call(this, options);
            var form = this.$('form');

            this.on('save', function(){
                eval(options.functions.save);
            });

            this.on('ready', function(){
                eval(options.functions.setup);
            });
        },

        render: function(options) {
            FormModal.prototype.render.call(this, options);
        }
    });

    return customForm;
});