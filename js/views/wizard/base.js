define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'model/gnome'
], function($, _, Backbone, swal, GnomeModel){
    'use strict';
    var baseWizard = Backbone.View.extend({
        steps: [],
        step: 0,
        furthestStep: 0,

        start: function(){
            this.steps[this.step].render();
            _.each(this.steps, this.register, this);
        },

        next: function(){
            if(this.steps[this.step].$el.is(':hidden')){
                this.next_();
            } else {
                this.steps[this.step].once('hidden', this.next_, this);
            }
        },

        next_: function(){
            this.step++;
            if(this.steps[this.step].rendered_){
                this.steps[this.step].show();
            } else {
                this.steps[this.step].render();
            }
            this.furthestStep = this.step;
        },

        prev: function(){
            if(this.steps[this.step].$el.is(':hidden')){
                this.prev_();
            } else {
                this.steps[this.step].once('hidden', this.prev_, this);
            }
        },

        prev_: function(){
            this.step--;
            if(this.steps[this.step].rendered_){
                this.steps[this.step].show();
            } else {
                this.steps[this.step].render();
            }
        },

        goto: function(step){
            this.step = step;
            if(this.steps[this.step].rendered_){
                this.steps[this.step].show();
            } else {
                this.steps[this.step].render();
            }
        },

        register: function(step){
            step.on('save', this.next, this);
            step.on('back', this.prev, this);
            step.on('wizardclose', this.confirmClose, this);
            step.on('finish', this.close, this);
        },

        confirmClose: function() {
            if (!this.nonmodelWizard) {
                swal.fire({
                        title: "Are you sure?",
                        text: "You will lose all the entered model data!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, I am sure",
                        cancelButtonText: "Go back",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    }).then(_.bind(function(isConfirm) {
                        if (isConfirm) {
                            webgnome.model = new GnomeModel();
                            webgnome.model.save(null, {validate: false});
                            this.close();
                        } else {
                            this.steps[this.step].show();
                        }
                    }, this));
            } else {
                this.close();
            }
        },

        close: function(){
            _.each(this.steps, function(step){
                if(step.$el.is(':hidden')){
                    step.close();
                } else {
                    step.once('hidden', step.close, step);
                }
            });
            this.unbind();
            this.remove();
        }
    });

    return baseWizard;
});