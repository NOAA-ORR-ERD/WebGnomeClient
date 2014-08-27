define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'jqueryui/core',
    'model/resources/oilDistinct',
    'views/modal/form',
    'views/form/oilQuery/oilTable',
    'views/modal/loading',
    'text!templates/form/oilLib.html'
], function($, _, Backbone, chosen, jqueryui, OilDistinct, FormModal, OilTable, LoadingModal, OilTemplate){
    var oilLibForm = FormModal.extend({
        name: 'oillib',
        title: 'Oil Query Form',
        size: 'lg',
        
        initialize: function(options){
            this.oilTable = new OilTable();

            // Initialize and render loading modal following request to view Oil Library collection

            this.loadingGif = new LoadingModal();
            this.loadingGif.render();

            // Passed oilTable's events hash to this view's events
            
            this.events = _.defaults(this.oilTable.events, FormModal.prototype.events);
            this.oilTable.on('renderTable', this.renderTable, this);

            // Initialized oilDistinct collection so it is available for the view render

            this.oilDistinct = new OilDistinct(_.bind(this.setUpOptions, this));
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            if(this.oilTable.ready){
                console.trace();
                // Removes loading modal just prior to render call of oilLib

                this.loadingGif.hide();
                
                // Template in oilTable's html to oilLib's template prior to render call

                this.body = _.template(OilTemplate, {
                    oilTable: this.oilTable.$el.html()
                });

                // Placeholder value for chosen that allows it to be properly scoped aka be usable by the view

                var chosen = jQuery.fn.chosen;
                FormModal.prototype.render.call(this, options);

                // Initialize the select menus of class chosen-select to use the chosen jquery plugin

                this.$('.chosen-select').chosen({width: '265px'});
                $.each(this.oilDistinct.models[2].attributes.values, function(key, value){
                    $('.chosen-select')
                        .append($('<option class="category"></option>')
                            .attr('value', value)
                            .text(value));
                });
                this.$('.chosen-select').trigger('chosen:updated');

                // Grabbing the minimum and maximum api values from the fetched collection
                // so the slider only covers the range of relevant values when rendered
                if (!min && !max){
                    var min = Math.floor(_.min(this.oilTable.oilLib.models, 
                                function(model){ return model.attributes.api; }).attributes.api);
                    var max = Math.ceil(_.max(this.oilTable.oilLib.models, 
                                function(model){ return model.attributes.api; }).attributes.api);
                }

                // Use the jquery-ui slider to enable a slider so the user can select the range of API
                // values they would want to search for

                this.createSliders(min, max);
            } else {
                this.oilTable.on('ready', this.render, this);
            }
        },

        renderTable: function(){
            this.$('#tableContainer').html(this.oilTable.$el.html());
        },

        populateSelect: function(){

        },

        setUpOptions: function(){

        },

        update: function(){
            var search = {
                text: $.trim(this.$('#search').val()),
                category: this.$('select.chosen-select option:selected').val(),
                api: this.$('.slider').slider('values')
            };
            console.log(search);
            if(!search.text && search.api.length !== 2){
                this.oilTable.oilLib.models = this.oilTable.oilLib.originalModels;
                this.oilTable.oilLib.length = this.oilTable.oilLib.models.length;
            }
            else {
                this.oilTable.oilLib.bySearch(search);
            }
            this.oilTable.render();
        },

        headerClick: function(e){
            this.oilTable.headerClick(e);
        },

        createSliders: function(minNum, maxNum){
            this.$('.slider').slider({
                        range: true, 
                        min: minNum, 
                        max: maxNum,
                        values: [minNum, maxNum],
                        create: _.bind(function(e, ui){
                           this.$('.ui-slider-handle:first').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             minNum + '</div></div>');
                           this.$('.ui-slider-handle:last').html('<div class="tooltip bottom slider-tip" style="display: visible;"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             maxNum + '</div></div>');
                        }, this),
                        slide: _.bind(function(e, ui){
                           this.$('.ui-slider-handle:first').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[0] + '</div></div>');
                           this.$('.ui-slider-handle:last').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + 
                                                             ui.values[1] + '</div></div>');
                        }, this),
                        stop: _.bind(function(e, ui){
                            this.update();
                        }, this)
                    });
        }
    });

    return oilLibForm;
});