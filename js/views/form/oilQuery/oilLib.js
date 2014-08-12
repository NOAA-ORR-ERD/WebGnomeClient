define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'jqueryui/core',
    'views/modal/form',
    'views/form/oilQuery/oilTable',
    'text!templates/form/oilLib.html'
], function($, _, Backbone, chosen, jqueryui, FormModal, OilTable, OilTemplate){
    var oilLibForm = FormModal.extend({
        name: 'oillib',
        title: 'Oil Query Form',
        size: 'lg',
        // data: [{name: 'oil1', api: 30}, {name: 'oil2', api: 40}, {name: 'oil3', api: 50}],
        
        initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(OilTemplate);

            // Placeholder value for chosen that allows it to be properly scoped aka be usable by the view

            var chosen = jQuery.fn.chosen;
            FormModal.prototype.render.call(this, options);

            // Initialize the select menus of class chosen-select to use the chose jquery plugin

            this.$('.chosen-select').chosen({width: '265px'});

            // Use the jquery-ui slider to enable a slider so the user can select the range of API
            // values they would want to search for
            this.createSliders(-2, 180);
            //this.generateTable();
        },

        createSliders: function(minNum, maxNum){
            this.$('.slider').slider({
                        range: true, 
                        min: minNum, 
                        max: maxNum,
                        values: [minNum, maxNum],
                        create: _.bind(function(e, ui){
                           this.$('.ui-slider-handle:first').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             minNum + '</div></div>');
                           this.$('.ui-slider-handle:last').html('<div class="tooltip top slider-tip" style="display: visible;"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             maxNum + '</div></div>');
                        }, this),
                        slide: _.bind(function(e, ui){
                           this.$('.ui-slider-handle:first').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[0] + '</div></div>');
                           this.$('.ui-slider-handle:last').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[1] + '</div></div>');
                        }, this)
                    });
        },

        generateTable: function(){
            this.oilTable = new OilTable();
            this.oilTable.render();
        }
    });

    return oilLibForm;
});