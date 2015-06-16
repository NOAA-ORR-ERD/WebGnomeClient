define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    'use strict';
    var baseWizard = Backbone.View.extend({
        steps: [],
        step: 0,

        start: function(){
            this.steps[this.step].render();
            _.each(this.steps, function(el){
                el.on('save', this.next, this);
                el.on('back', this.prev, this);
                el.on('wizardclose', this.close, this);
                el.on('finish', this.close, this);
            }, this);
        },

        next: function(){
            this.step++;
            this.steps[this.step].render();
        },

        prev: function(){
            this.step--;
            this.steps[this.step].render();
        },

        goto: function(step){
            this.step = step;
            this.steps[this.step].render();
        },

        register: function(step){
            step.on('next', this.next, this);
            step.on('back', this.prev, this);
            step.on('wizardclose', this.close, this);
        },

        close: function(){
            _.each(this.steps, function(el){
                el.close();
            });

            this.unbind();
            this.remove();
        }
    });

    return baseWizard;
});