define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryui/core',
    'views/modal/form',
    'text!templates/risk/tuning.html',
    'text!templates/risk/relativeimportance.html',
    'text!templates/risk/slider.html',
    'text!templates/risk/relativeimportancetable.html',
    'relativeimportance'
], function($, _, Backbone, jqueryui, FormModal, RiskTemplate, RelativeImportanceTemplate, SliderTemplate, RelImpTableTemplate, RelativeImportance) {
    var riskForm = FormModal.extend({
        className: 'modal form-modal risk-form tuning',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',
        effChanged: false,

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
            this.model.updateEfficiencies();
        },

        render: function(options){
            var showDispersant, showBurn, showSkimming;
            _.each(webgnome.model.get('weatherers').models, function(el, idx){
                if (el.attributes.obj_type === "gnome.weatherers.cleanup.ChemicalDispersion") {
                    showDispersant = true;
                } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Burn") {
                    showBurn = true;
                } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Skimmer") {
                    showSkimming = true;
                }
            });

            this.model.deriveAssessmentTime();

            this.body = _.template(RiskTemplate, {
                assessmentTime: this.model.get('assessmentTime')
            });

            FormModal.prototype.render.call(this, options);

            if (showSkimming){
                this.createSlider('Skimming', parseInt(this.model.get('efficiency').Skimming * 100, 10));
            }
            if (showDispersant){
                this.createSlider('Dispersion', parseInt(this.model.get('efficiency').Dispersion * 100, 10));
            }
            if (showBurn){
                this.createSlider('Burn', parseInt(this.model.get('efficiency').Burn * 100, 10));
            }
            this.relativeImp = new RelativeImportance('importance',
            {
                sideLength: 150,
                point1: {label: 'Subsurface'},
                point2: {label: 'Surface'},
                point3: {label: 'Shoreline'},
                callback: _.bind(this.relativeImportancePercent, this)
            });

            setTimeout(_.bind(function(){
                this.renderRelativeImportance();
            }, this), 25);
        },

        renderRelativeImportance: function(){
            this.relativeImp.draw();

            this.on('relativeRendered', _.bind(function(){
                this.renderTable(this.tableData);
            }, this));

            this.trigger('relativeRendered');
        },

        relativeImportancePercent: function(data){
            this.$('.relative-importance').html('');
            var relativeimportance = _.template(RelativeImportanceTemplate, {
                'data': data
            });
            this.$('.relative-importance').html(relativeimportance);
            this.tableData = data;
            this.trigger('relativeRendered');

            this.model.set('relativeImportance', this.tableData);
        },

        renderTable: function(data){
            this.$('.relative-importance').html('');
            var template = _.template(RelImpTableTemplate, {
                'data': data
            });
            this.$('.relative-importance').html(template);
            this.updateBenefit();
        },

        updateBenefit: function(){
            var benefit = Math.round(this.model.calculateBenefit() * 100);
            this.$('google-chart').attr('data', '[["Label", "Value"], ["Benefit", ' + benefit + ']]');
        },

        createSlider: function(selector, value){
            var sliderTemplate = _.template(SliderTemplate, {'selector': selector});

            this.$('.sliders-container').append(sliderTemplate);
            
            this.$('#' + selector + ' .slider').slider({
                    max: 100,
                    min: 0,
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$('#' + selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                           this.updateTooltipWidth();
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$('#' + selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                           this.updateTooltipWidth();
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.reassessRisk(selector);
                        }, this)
            });
        },

        reassessRisk: function(selector){
            var sliderEff = this.$('#' + selector + ' .slider').slider('value');
            // set model
            var eff = this.model.get('efficiency');
            eff[selector] = sliderEff / 100;

            this.model.set('efficiency', eff);

            var gnomeEff;

            if (selector === 'Dispersion'){
                var obj_str = 'Chemical' + selector;
                gnomeEff = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.' + obj_str}).get('efficiency') * 100;
            } else if (selector === 'Skimming'){
                gnomeEff = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.Skimmer'}).get('efficiency') * 100;
            } else {
                gnomeEff = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.' + selector}).get('efficiency') * 100;
            }

            if (gnomeEff !== sliderEff){
                this.$('#' + selector + ' p').removeClass('hide');
                this.effChanged = true;
            } else {
                this.$('#' + selector + ' p').addClass('hide');
                this.effChanged = false;
            }

            // assess model
            this.model.assessment();
        },

        save: function(e){
            e.preventDefault();
            this.model.save();
            FormModal.prototype.wizardclose.call(this);
        }

    });

    return riskForm;
});
