define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'chosen',
    'moment',
    'jqueryui/core',
    'model/oil/distinct',
    'views/modal/form',
    'views/form/oil/table',
    'views/modal/loading',
    'views/form/oil/specific',
    'text!templates/form/oil.html'
], function($, _, Backbone, module, chosen, moment, jqueryui, OilDistinct, FormModal, OilTable, LoadingModal, SpecificOil, OilTemplate){
    var oilLibForm = FormModal.extend({
        className: 'modal fade form-modal oil-form',
        name: 'oillib',
        title: 'Oil Query Form',
        size: 'lg',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="backOil">Back</button><button type="button" class="save">Select</button>',
        
        events: function(){
            // Overwriting the update listeners so they do not fire for the chosen input box
            var formModalHash = FormModal.prototype.events;
            delete formModalHash['change input'];
            delete formModalHash['keyup input'];
            formModalHash['change input:not(.chosen-search input)'] = 'update';
            formModalHash['keyup input:not(.chosen-search input)'] = 'update';
            formModalHash['click .nav-tabs a'] = 'rendered';
            formModalHash['ready'] = 'triggerTableResize';
            return _.defaults(OilTable.prototype.events, formModalHash);
        },
        
        initialize: function(options, elementModel){
            this.module = module;
            this.oilTable = new OilTable();
            this.model = elementModel;
            this.oilCache = localStorage.getItem('oil_cache');
            this.loadModal;
            var oilCacheJson = JSON.parse(this.oilCache);
            // Initialize and render loading modal following request to view Oil Library collection

            if (moment().unix() - oilCacheJson.ts > 86400){
                this.loadModal = true;
            }

            if (_.isNull(this.oilCache) || this.loadModal){
                this.loadingGif = new LoadingModal({title: "Loading Oil Database..."});
                this.loadingGif.render();
            }

            // Passed oilTable's events hash to this view's events
            
            this.oilTable.on('renderTable', this.renderTable, this);

            // Initialized oilDistinct collection so it is available for the view render

            this.oilDistinct = new OilDistinct();
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            if(this.oilTable.ready){
                // Removes loading modal just prior to render call of oilLib

                if (_.isNull(this.oilCache) || this.loadModal){
                    this.loadingGif.hide();
                }
                // Template in oilTable's html to oilLib's template prior to render call

                this.body = _.template(OilTemplate, {
                    oilTable: this.oilTable.$el.html(),
                    results: this.oilTable.oilLib.length
                });

                // Placeholder value for chosen that allows it to be properly scoped aka be usable by the view

                FormModal.prototype.render.call(this, options);

                this.$('.oilInfo').hide();
                this.$('.backOil').hide();

                var oilImported = this.model.get('substance').get('imported');

                if (!_.isUndefined(oilImported)){
                    this.$('tr[data-id="' + oilImported.adios_oil_id + '"]').addClass('select');
                }

                // Initialize the select menus of class chosen-select to use the chosen jquery plugin

                this.populateSelect();

                // Grabbing the minimum and maximum api, and viscosity values from the fetched collection
                // so the slider only covers the range of relevant values when rendered
                
                this.findMinMax(['api', 'viscosity', 'pour_point']);

                if (this.viscosity_max.toString().length > 3){
                    this.viscosity_max = this.viscosity_max.toExponential();
                }

                // Use the jquery-ui slider to enable sliders so the user can select the range of API,
                // viscosity, and/or pour point values they would want to search for
                this.createSliders(this.api_min, this.api_max, '.slider-api');
                this.createSliders(this.viscosity_min, this.viscosity_max, '.slider-viscosity');
                this.createSliders(this.pour_point_min, this.pour_point_max, '.slider-pourpoint');
            } else {
                this.oilTable.on('ready', this.render, this);
            }
        },

        rendered: function(e){
            this.$('.tab-pane').removeClass('active');
            this.$(e.target.hash).addClass('active');
        },

        triggerTableResize: function(){
            var width = this.$('#tableContainer-inner').css('width');
            this.$('.table-header').css('width', width);
        },

        findMinMax: function(arr){
            var obj = {};
            for (var i = 0; i < arr.length; i++){
                var quantity = arr[i];
                var min = quantity + '_min';
                var max = quantity + '_max';
                if (!this[min] && !this[max] && quantity !== 'pour_point'){
                    this[min] = Math.floor(_.min(this.oilTable.oilLib.models,
                        function(model){ return model.attributes[quantity]; }).attributes[quantity]);
                    this[max] = Math.ceil(_.max(this.oilTable.oilLib.models,
                        function(model){ return model.attributes[quantity]; }).attributes[quantity]);
                } else {
                    this[min] = Math.floor(_.min(this.oilTable.oilLib.models,
                        function(model){ return model.attributes[quantity][0]; }).attributes[quantity][0]);
                    this[max] = Math.ceil(_.max(this.oilTable.oilLib.models,
                        function(model){ return model.attributes[quantity][1]; }).attributes[quantity][1]);
                }
                obj[quantity] = {'min': this[min], 'max': this[max]};
            }
            return obj;
        },

        renderTable: function(){
            this.$('#tableContainer').html(this.oilTable.$el.html());
        },

        populateSelect: function(){
            this.$('.chosen-select').chosen({width: '192.5px', no_results_text: 'No results match: '});
            var valueObj = this.oilDistinct.at(2).get('values');
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
        },

        update: function(){
            var search = {
                text: $.trim(this.$('#search').val()),
                category: {'parent': this.$('select.chosen-select option:selected').parent().attr('label'),
                           'child': this.$('select.chosen-select option:selected').val()},
                api: this.$('.slider-api').slider('values'),
                viscosity: this.$('.slider-viscosity').slider('values'),
                pour_point: this.$('.slider-pourpoint').slider('values')
            };
            if(!search.text && search.category.child === 'All' && search.api === [this.api_min, this.api_max]){
                this.oilTable.oilLib.models = this.oilTable.oilLib.originalModels;
                this.oilTable.oilLib.length = this.oilTable.oilLib.models.length;
            } else if (search.text.indexOf("number") > -1 || search.text.indexOf("no.") > -1 || search.text.indexOf("#") > -1){
                search.text = search.text.replace(/^.*(number|#).*$/, "no.");
                this.oilTable.oilLib.search(search);
            } else {
                this.oilTable.oilLib.search(search);
            }
            this.oilTable.render();
            this.triggerTableResize();
            this.$('.resultsLength').empty();
            this.$('.resultsLength').text('Number of results: ' + this.oilTable.oilLib.length);
        },

        headerClick: function(e){
            this.oilTable.headerClick(e);
            this.triggerTableResize();
        },

        oilSelect: function(e){
            this.$('tr').removeClass('select');
            this.$(e.currentTarget).parent().addClass('select');
            this.$('.oilInfo').show();
            this.model.get('substance').set('adios_oil_id', this.$('.select').data('id'));
        },

        viewSpecificOil: function(){
            this.oilId = this.$('.select').data('id');
            if (this.oilId) {
                this.$('.oilContainer').hide();
                this.oilTable.oilLib.fetchOil(this.oilId, _.bind(function(model){
                   this.specificOil = new SpecificOil({model: model});
                }, this));
            }
            this.$('.backOil').show();
            this.$('.cancel').hide();
        },

        close: function(){
            if(this.specificOil){
                this.specificOil.close();
            }
            this.oilTable.close();
            this.trigger('close');
            FormModal.prototype.close.call(this);
        },

        save: function(){
            this.oilName = this.$('.select').data('name');
            this.model.get('substance').set('name', this.oilName);
            this.model.get('substance').fetch({
                success: _.bind(function(model){
                    this.model.set('substance', model);
                    this.hide();
                    this.trigger('save');
                }, this)
            });
        },

        createSliders: function(minNum, maxNum, selector){
            this.$(selector).slider({
                        range: true,
                        min: minNum,
                        max: maxNum,
                        values: [minNum, maxNum],
                        create: _.bind(function(){
                           this.$(selector + ' .ui-slider-handle:first').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' +
                                                             minNum + '</div></div>');
                           this.$(selector + ' .ui-slider-handle:last').html('<div class="tooltip bottom slider-tip" style="display: visible;"><div class="tooltip-arrow"></div><div class="tooltip-inner">' +
                                                             maxNum + '</div></div>');
                        }, this),
                        slide: _.bind(function(e, ui){
                           this.$(selector + ' .ui-slider-handle:first').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' +
                                                             ui.values[0] + '</div></div>');
                           this.$(selector + ' .ui-slider-handle:last').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' +
                                                             ui.values[1] + '</div></div>');
                        }, this),
                        stop: _.bind(function(){
                            this.update();
                        }, this)
                    });
        },

        goBack: function(e){
            e.preventDefault();
            this.specificOil.close();
            this.$('.backOil').hide();
            this.$('.cancel').show();
            this.$('.oilContainer').show();
        }
    });

    return oilLibForm;
});