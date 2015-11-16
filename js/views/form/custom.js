define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
], function($, _, Backbone, FormModal){
    'use strict';
    var customForm = FormModal.extend({

        events: function(){
            return _.defaults({
                'click .option': 'save'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
            var form = this.$('form');
            var modal = this.el;
            var modaljq = this.$el;

            this.on('save', function(){
                eval(options.functions.save);
            }, this);

            this.on('ready', function(){
                eval(options.functions.setup);
            }, this);

        }
    });

    return customForm;
});