define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryui/core',
    'fabric',
    'gauge',
    'views/modal/form',
    'text!templates/risk/tuning.html',
    'text!templates/risk/relativeimportance.html',
    'relativeimportance',
    'relimpui'
], function($, _, Backbone, jqueryui, fabric, Gauge, FormModal, RiskTemplate, RelativeImportanceTemplate, Triangle) {
    var riskForm = FormModal.extend({
        className: 'modal fade form-modal risk-form',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',
        benefitGauge: null,
        self: null,

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
            self = this;
        },

        render: function(options){
            var showDispersant, showBurn, showSkimming;
            _.each(webgnome.model.get('weatherers').models, function(el, idx){
                if (el.attributes.obj_type === "gnome.weatherers.cleanup.Dispersion") {
                    if (el.attributes.name != "_natural") {
                        showDispersant = true;
                    }
                } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Burn") {
                    showBurn = true;
                } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Skimmer") {
                    showSkimming = true;
                }
            });

            this.relativeImportancePercent({});

            this.body = _.template(RiskTemplate, {
                surface: this.model.get('surface').toFixed(3),
                column: this.model.get('column').toFixed(3),
                shoreline: this.model.get('shoreline').toFixed(3),
                showDispersant: showDispersant,
                showBurn: showBurn,
                showSkimming: showSkimming
            });

            FormModal.prototype.render.call(this, options);

            this.createBenefitGauge('benefit', 50);

            this.createSlider('.slider-skimming', this.model.get('efficiency').skimming);
            this.createSlider('.slider-dispersant', this.model.get('efficiency').dispersant);
            this.createSlider('.slider-in-situ-burn', this.model.get('efficiency').insitu_burn);

            this.relativeImp = new Triangle('importance',
                {   sideLength: 150,
                    point1Name: 'column',
                    point2Name: 'surface',
                    point3Name: 'shoreline',
                    callback: _.bind(this.relativeImportancePercent, this)
                });

            this.relativeImp.draw();

            this.updateBenefit();
        },

        relativeImportancePercent: function(data){
            this.$('.relative-importance').html('');
            var relativeimportance = _.template(RelativeImportanceTemplate, {
                'data': data
            });
            this.$('.relative-importance').html(relativeimportance);
        },

        createBenefitGauge: function(selector, value){
            var opts = {
                angle: 0, // The length of each line
                pointer: {
                    length: 0.5, // The radius of the inner circle
                    strokeWidth: 0.035, // The rotation offset
                    color: '#000000' // Fill color
                },
                limitMax: 'true',   // If true, the pointer will not go past the end of the gauge
                colorStart: '#ff0000',   // Colors
                colorStop: '#00ff00',    // just experiment with them
                strokeColor: '#E0E0E0',   // to see which ones work best for you
                generateGradient: true,
                gradientType: 1,
                maxValue: 100,
                animationSpeed: 20
            };
            var target = document.getElementById(selector); // your canvas element
            this.benefitGauge = new Gauge(target).setOptions(opts);
        },

        createSlider: function(selector, value){
            this.$(selector).slider({
                    max: 100,
                    min: 0,
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.reassessRisk();
                        }, this)
            });
        },

        reassessRisk: function(){
            var skimming = this.$('.slider-skimming').slider('value');
            var dispersant = this.$('.slider-dispersant').slider('value');
            var insitu_burn = this.$('.slider-in-situ-burn').slider('value');

            // set model
            var e = this.model.get('efficiency');
            e.skimming = skimming;
            e.dispersant = dispersant;
            e.insitu_burn = insitu_burn;

            // assess model
            this.model.assessment();

            this.updateBenefit();
        },

        // callback from relative importance ui when values change.
        // to update the UI values and set model values.
        calculateRI: function(objects){
            var surfaceRI = objects['surface'];
            var columnRI = objects['column'];
            var shorelineRI = objects['shoreline'];
            var t = surfaceRI + columnRI + shorelineRI;

            // set model
            var ri = self.model.get('relativeImportance');
            ri.surface = surfaceRI / t;
            ri.column = columnRI / t;
            ri.shoreline = shorelineRI / t;

            // update ui
            self.$('#surfaceRI').html((ri.surface*100).toFixed(3));
            self.$('#columnRI').html((ri.column*100).toFixed(3));
            self.$('#shorelineRI').html((ri.shoreline*100).toFixed(3));

            self.updateBenefit();
        },

        updateBenefit: function(){
            var ri = this.model.get('relativeImportance');
            var surface = this.model.get('surface');
            var column = this.model.get('column');
            var shoreline = this.model.get('shoreline');
            var benefit = (1 - (ri.surface * surface + ri.column * column + ri.shoreline * shoreline)) * this.benefitGauge.maxValue;

            // update ui
            this.$('#surface').html((surface).toFixed(3));
            this.$('#column').html((column).toFixed(3));
            this.$('#shoreline').html((shoreline).toFixed(3));

            this.benefitGauge.set(benefit);
        }

    });

    return riskForm;
});
