define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'jqueryui/core',
    'views/modal/form',
    'text!templates/form/oilLib.html'
], function($, _, Backbone, chosen, jqueryui, FormModal, OilTemplate){
    var oilLibForm = FormModal.extend({
        name: 'oillib',
        title: 'Oil Query Form',
        
        initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(OilTemplate);

            // Placeholder value for chosen that allows it to be properly scoped aka usable by the view

            var chosen = jQuery.fn.chosen;
            FormModal.prototype.render.call(this, options);

            // Initialize the select menus of class chosen-select to use the chose jquery plugin

            this.$('.chosen-select').chosen({width: '350px'});

            // Use the jquery-ui slider to enable a slider so the user can select the range of API
            // values they would want to search for
            this.createSliders();
        },

        createSliders: function(){
            this.$('.slider').slider({
                        range: true, 
                        min: -2, 
                        max: 180,
                        values: [-2,180],
                        create: function(e, ui){
                           $('.ui-slider-handle:first').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[0] + '</div></div>');
                           $('.ui-slider-handle:last').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[1] + '</div></div>');
                        },
                        slide: function(e, ui){
                           $('.ui-slider-handle:first').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[0] + '</div></div>');
                           $('.ui-slider-handle:last').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[1] + '</div></div>');
                           console.log(ui);
                        }
                    });
        }
    });

    return oilLibForm;
});