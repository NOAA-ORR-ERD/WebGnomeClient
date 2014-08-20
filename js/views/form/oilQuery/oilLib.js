define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'jqueryui/core',
    'views/modal/form',
    'views/form/oilQuery/oilTable',
    'text!templates/form/oilLib.html',
    'datatables'
], function($, _, Backbone, chosen, jqueryui, FormModal, OilTable, OilTemplate, datatables){
    var oilLibForm = FormModal.extend({
        name: 'oillib',
        title: 'Oil Query Form',
        size: 'lg',
        
        initialize: function(options){
            this.oilTable = new OilTable({location: 'ALASKA'});
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            if(this.oilTable.ready){
                console.log(this.oilTable.$el);
                this.body = _.template(OilTemplate, {
                    oilTable: this.oilTable.$el.html()
                });

                // Placeholder value for chosen that allows it to be properly scoped aka be usable by the view

                var chosen = jQuery.fn.chosen;
                FormModal.prototype.render.call(this, options);

                // Initialize the select menus of class chosen-select to use the chosen jquery plugin

                this.$('.chosen-select').chosen({width: '265px'});

                // Use the jquery-ui slider to enable a slider so the user can select the range of API
                // values they would want to search for
                this.createSliders(-2, 180);
            } else {
                this.oilTable.on('ready', this.render, this);
            }
        },

        update: function(){
            this.oilTable = new OilTable({location: 'ALASKA'});
            FormModal.prototype.initialize.call(this, options);
            console.log("updated!");
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
                        }, this),
                        stop: _.bind(function(e, ui){
                            console.log(ui.values);
                        }, this)
                    });
        }
    });

    return oilLibForm;
});