define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/risk/tuning.html',
    'text!templates/risk/relativeimportance.html',
    'text!templates/risk/slider.html',
    'text!templates/risk/relativeimportancetable.html',
    'relativeimportance',
    'jqueryui/widgets/slider'
], function($, _, Backbone, FormModal, RiskTemplate, RelativeImportanceTemplate, SliderTemplate, RelImpTableTemplate, RelativeImportance) {
    var riskForm = FormModal.extend({
        className: 'modal form-modal risk-form tuning',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',
        effChanged: false,

        events: function() {
            return _.defaults({
                'click input': 'updateEfficiency'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
            this.model.updateEfficiencies();
            this.cleanups = webgnome.model.getCleanup();
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

            this.model.assessment();

            this.body = _.template(RiskTemplate)({
                assessmentTime: this.model.get('assessmentTime')
            });

            FormModal.prototype.render.call(this, options);

            var firstEff = this.appendRadioButtons();

            this.createSlider('response', parseInt(this.model.get('efficiency')[firstEff] * 100, 10));

            this.model.set('active_cleanup', firstEff);

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

        show: function() {
            FormModal.prototype.show.call(this);
            this.updateBenefit();
        },

        updateEfficiency: function(e) {
            var effType = this.$(e.target).val();
            var currentEff = parseInt(this.model.get('efficiency')[effType] * 100, 10);
            this.sliderjq.slider('value', currentEff);
            this.updateTooltip(currentEff);
            this.model.set('active_cleanup', effType);
            this.reassessRisk();
        },

        updateTooltip: function(value) {
            this.$('.tooltip-inner').text(value);
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
            var relativeimportance = _.template(RelativeImportanceTemplate)({
                'data': data
            });
            this.$('.relative-importance').html(relativeimportance);
            this.tableData = data;
            this.trigger('relativeRendered');

            this.model.set('relativeImportance', this.tableData);
        },

        renderTable: function(data){
            this.$('.relative-importance').html('');
            var template = _.template(RelImpTableTemplate)({
                'data': data
            });
            this.$('.relative-importance').html(template);
            this.updateBenefit();
        },

        updateBenefit: function(){
            var benefit = Math.round(this.model.calculateBenefit() * 100);
            this.$('google-chart').attr('data', '[["Label", "Value"], ["Benefit", ' + benefit + ']]');
        },

        appendRadioButtons: function() {
            var cleanups = this.cleanups;
            for (var key in cleanups) {
                var label = key;
                if (label === 'ChemicalDispersion') {
                    label = 'Chemical Dispersion';
                }
                if (cleanups[key].length > 0) {
                    this.$('.radio-buttons').append('<div class="radio"><label><input type="radio" name="cleanup" id="' + key + '" value="' + key + '"/>' + label + '</label></div>');
                }
            }

            var firstRadio = this.$('.radio-buttons input').first();
            firstRadio.prop('checked', true);

            return firstRadio.val();
        },

        createSlider: function(selector, value){
            var sliderTemplate = _.template(SliderTemplate)({'selector': selector});

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
                            this.reassessRisk();
                        }, this)
            });

            this.sliderjq = this.$('#' + selector + ' .slider');
        },

        reassessRisk: function(){
            var sliderEff = this.sliderjq.slider('value');
            // set model
            var eff = this.model.get('efficiency');
            var type = this.$('.radio-buttons input:radio[name=cleanup]:checked').val();
            eff[type] = sliderEff / 100;

            this.model.set('efficiency', eff);

            var gnomeEff = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.' + type}).get('efficiency') * 100;

            this.effChanged = Math.floor(gnomeEff) !== sliderEff;

            // // assess model
            this.model.assessment();

            this.updateBenefit();
        },

        save: function(e){
            e.preventDefault();
            this.model.save();
            if (this.effChanged) {
                webgnome.cache.rewind();
            }
            this.hide();
        }

    });

    return riskForm;
});
