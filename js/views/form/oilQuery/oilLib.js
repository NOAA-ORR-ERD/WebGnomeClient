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
    'views/form/oilQuery/specificOil',
    'text!templates/form/oilLib.html'
], function($, _, Backbone, chosen, jqueryui, OilDistinct, FormModal, OilTable, LoadingModal, SpecificOil, OilTemplate){
    var oilLibForm = FormModal.extend({
        name: 'oillib',
        title: 'Oil Query Form',
        size: 'lg',

        events: function(){
            return _.defaults(OilTable.prototype.events, FormModal.prototype.events);
        },
        
        initialize: function(options){
            this.oilTable = new OilTable();

            // Initialize and render loading modal following request to view Oil Library collection

            this.loadingGif = new LoadingModal();
            this.loadingGif.render();

            // Passed oilTable's events hash to this view's events
            
            this.oilTable.on('renderTable', this.renderTable, this);

            // Initialized oilDistinct collection so it is available for the view render

            this.oilDistinct = new OilDistinct(_.bind(this.setUpOptions, this));
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            console.log(this.events());
            if(this.oilTable.ready){
                // Removes loading modal just prior to render call of oilLib

                this.loadingGif.hide();
                
                // Template in oilTable's html to oilLib's template prior to render call

                this.body = _.template(OilTemplate, {
                    oilTable: this.oilTable.$el.html(),
                    results: this.oilTable.oilLib.length
                });

                // Placeholder value for chosen that allows it to be properly scoped aka be usable by the view

                var chosen = jQuery.fn.chosen;
                FormModal.prototype.render.call(this, options);

                // Initialize the select menus of class chosen-select to use the chosen jquery plugin

                this.$('.chosen-select').chosen({width: '265px', no_results_text: "No results match: "});
                var valueObj = this.oilDistinct.models[2].attributes.values;
                this.$('.chosen-select').append($('<option></option>').attr('value', 'All').text('All'));
                for (var key in valueObj){
                    this.$('.chosen-select')
                        .append($('<optgroup class="category" id="' + key + '"></optgroup>')
                            .attr('value', key)
                            .attr('label', key));
                    for (var i = 0; i < valueObj[key].length; i++){
                        this.$('#' + key).append($('<option class="subcategory"></option>')
                            .attr('value', valueObj[key][i])
                            .text(key + '-' + valueObj[key][i]));
                    }
                }
                this.$('.chosen-select').trigger('chosen:updated');

                // Grabbing the minimum and maximum api values from the fetched collection
                // so the slider only covers the range of relevant values when rendered
                if (!this.min && !this.max){
                    this.min = Math.floor(_.min(this.oilTable.oilLib.models, 
                                function(model){ return model.attributes.api; }).attributes.api);
                    this.max = Math.ceil(_.max(this.oilTable.oilLib.models, 
                                function(model){ return model.attributes.api; }).attributes.api);
                }

                // Use the jquery-ui slider to enable a slider so the user can select the range of API
                // values they would want to search for

                this.createSliders(this.min, this.max);
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
                category: {'parent': this.$('select.chosen-select option:selected').parent().attr('label'), 
                           'child': this.$('select.chosen-select option:selected').val()},
                api: this.$('.slider').slider('values')
            };
            if(!search.text && search.category.child === 'All' && search.api === [this.min, this.max]){
                this.oilTable.oilLib.models = this.oilTable.oilLib.originalModels;
                this.oilTable.oilLib.length = this.oilTable.oilLib.models.length;
            }
            else {
                this.oilTable.oilLib.bySearch(search);
            }
            this.oilTable.render();
            this.$('.resultsLength').empty();
            this.$('.resultsLength').text('Number of results: ' + this.oilTable.oilLib.length);
        },

        headerClick: function(e){
            this.oilTable.headerClick(e);
        },

        oilSelect: function(e){
            this.$('.oilContainer').hide();
            var id = $(e.currentTarget).parent().data('id');
            this.oilTable.oilLib.fetchOil(id, _.bind(function(model){
               this.specificOil = new SpecificOil({model: model}); 
            }, this));
        },

        close: function(){
            this.specificOil.close();
            this.oilTable.close();
            FormModal.prototype.close.call(this);
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
        },

        goBack: function(e){
            e.preventDefault();
            this.specificOil.close();
            this.$('.oilContainer').show();
            console.log('back pressed');
        }
    });

    return oilLibForm;
});