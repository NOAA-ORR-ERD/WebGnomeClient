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
            var step = this.steps[this.step];
            step.render();
            this.register(step);
        },

        next: function(){
            this.steps[this.step].once('hidden', _.bind(function(){
                this.steps[this.step].close();
                this.step++;
                this.steps[this.step].render();
                this.register(this.steps[this.step]);
            }, this));
        },

        prev: function(){
            this.steps[this.step].once('hidden', _.bind(function(){
                this.steps[this.step].close();
                this.step--;
                this.steps[this.step].render();
                this.register(this.steps[this.step]);
            }, this));
        },

        goto: function(step){
            this.step = step;
            this.steps[this.step].render();
        },

        register: function(step){
            step.on('save', this.next, this);
            step.on('back', this.prev, this);
            step.on('wizardclose', this.wizardclose, this);
            step.on('finish', this.wizardclose, this);
            step.delegateEvents();
        },

        wizardclose: function(){
            _.each(this.steps, function(el){
                el.on('hidden', el.close, el);
                el.hide();
            });
            this.unbind();
            this.remove();
        }
    });

    return baseWizard;
});