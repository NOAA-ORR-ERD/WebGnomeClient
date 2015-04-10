define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'moment',
    'fabric',
    'gauge',
    'views/modal/form',
    'text!templates/risk/risk.html',
    'text!templates/risk/input.html',
    'text!templates/risk/tuning.html',
    'model/risk/risk',
    'jqueryui/slider',
    'jqueryDatetimepicker',
    'relimpui',
], function($, _, Backbone, module, moment, fabric, Gauge, FormModal, FormTemplate, InputTemplate, TuningTemplate, RiskModel){
    var riskForm = FormModal.extend({
        title: 'Environmental Risk Assessment',
        className: 'modal fade form-modal risk-form',
        events: function(){
            return _.defaults({
                'shown.bs.tab': 'showTab',
                'click .store': 'store',
                'click .remodel': 'remodel',
                'click #era-tuning-link': this.inputValid
            }, FormModal.prototype.events);
        },
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="store btn btn-primary">Save</button>',

        benefitGauge: null,
        self: null,

        initialize: function(options) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.model = new RiskModel({id: 1234567890});
            var ri = this.model.get('relativeImportance');
            ri.surface = 1/3;
            ri.column = 1/3;
            ri.shoreline = 1/3;
            this.on('ready', this.rendered, this);

            self = this;
        },

        render: function(options) {
            this.body = _.template(FormTemplate, { });
            FormModal.prototype.render.call(this, options);

            this.form = {};
            this.form.isForm = true;

            this.renderInput(options);
            this.renderTuning(options);

            this.trigger('show');
        },

        renderTuning: function(options){
            var showDispersant = false;
            var showBurn = false;
            var showSkimming = false;
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

            compiled = _.template(TuningTemplate);
            template = compiled({
                surface: this.model.get('surface').toFixed(3),
                column: this.model.get('column').toFixed(3),
                shoreline: this.model.get('shoreline').toFixed(3),
                surfaceRI: (this.model.get('relativeImportance').surface * 100).toFixed(3),
                columnRI: (this.model.get('relativeImportance').column * 100).toFixed(3),
                shorelineRI: (this.model.get('relativeImportance').shoreline * 100).toFixed(3),
                showDispersant: showDispersant,
                showBurn: showBurn,
                showSkimming: showSkimming,
            });

            this.$('#era-tuning').html(template);

            this.createBenefitGauge('benefit', 50);

            this.createSlider('#skimming', this.model.get('efficiency').skimming);
            this.createSlider('#dispersant', this.model.get('efficiency').dispersant);
            this.createSlider('#insituburn', this.model.get('efficiency').insitu_burn);

            $('#importance').relativeImportanceUI({callback: this.calculateRI});

            this.updateBenefit();
        },

        renderInput: function(options){
            var compiled = _.template(InputTemplate);
            var template = compiled({
                area: this.model.get('area'),
                diameter: this.model.get('diameter'),
                distance: this.model.get('distance'),
                depth: this.model.get('depth'),
                assessment_time: moment(this.model.get('assessment_time')).format('YYYY/M/D H:mm')
            });

            this.$('#era-input').html(template);

            this.$('#area-units option[value="' + this.model.get('units').area + '"]').attr('selected', 'selected');
            this.$('#diameter-units option[value="' + this.model.get('units').diameter + '"]').attr('selected', 'selected');
            this.$('#distance-units option[value="' + this.model.get('units').distance + '"]').attr('selected', 'selected');
            this.$('#depth-units option[value="' + this.model.get('units').depth + '"]').attr('selected', 'selected');

            this.$('.date').datetimepicker({
                format: webgnome.config.date_format.datetimepicker
            });

            if (!this.model.isValid()) {
                this.$('#era-tuning-link').addClass('disabled');
            }

            this.form.area = this.$('#water-area');
            this.form.diameter = this.$('#water-diameter');
            this.form.distance = this.$('#distance-from-shore');
            this.form.depth = this.$('#average-water-depth');
            this.form.assessment_time = this.$('#assessment_time');
            this.form.units = {};
            this.form.units.area = this.$('#area-units');
            this.form.units.diameter = this.$('#diameter-units');
            this.form.units.distance = this.$('#distance-units');
            this.form.units.depth = this.$('#depth-units');
        },

        rendered: function() {
            this.$('.nav-tabs a[href="#era-input"]').tab('show');
        },

        showTab: function(e) {
            this.model.assessment();
        },

        update: function() {
            this.model.set('area', this.form.area.val());
            this.model.set('diameter', this.form.diameter.val());
            this.model.set('distance', this.form.distance.val());
            this.model.set('depth', this.form.depth.val());
            this.model.set('assessment_time', moment(this.form.assessment_time.val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss'));
            
            var units = this.model.get('units');
            units.area = this.form.units.area.val();
            units.diameter = this.form.units.diameter.val();
            units.distance = this.form.units.distance.val();
            units.depth = this.form.units.depth.val();
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
            var target = document.getElementById('benefit'); // your canvas element
            this.benefitGauge = new Gauge(target).setOptions(opts);
        },

        createSlider: function(selector, value){
            setTimeout(_.bind(function(){
                this.$(selector + ' .slider').slider({
                    min: 0,
                    max: 100,
                    value: value,
                    create: _.bind(function(){
                        this.$(selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + value + '</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateSlide(selector, ui);
                    }, this),
                    stop: _.bind(function(e, ui){
                        this.reassessRisk();
                    }, this)
                });

            }, this), 1);
        },

        updateSlide: function(selector, ui){
            var value;
            if (!_.isUndefined(ui)){
                value = ui.value;
            } else {
                value = !_.isNaN(this.$(selector + ' .slider').slider('value')) ? this.$(selector + ' .slider').slider('value') : 0;
            }
            this.$(selector + ' .tooltip-inner').text(value);
            this.updateTooltipWidth();

            // set model
            var e = self.model.get('efficiency');
            if (selector === "#skimming") {
                e.skimming = value;
            } else if (selector === "#dispersant") {
                e.dispersant = value;
            } else if (selector === "#insituburn") {
                e.insitu_burn = value;
            }
        },

        remodel: function(){
            var e = this.model.get('efficiency');
                _.each(webgnome.model.get('weatherers').models, function(el, idx){
                    if (el.attributes.obj_type === "gnome.weatherers.cleanup.Dispersion") {
                        if (el.attributes.name != "_natural") {
                            if (!_.isUndefined(el.attributes.efficiency)){
                                el.attributes.efficiency = e.dispersant / 100;
                            }
                        }
                    } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Burn") {
                        if (!_.isUndefined(el.attributes.efficiency)){
                            el.attributes.efficiency = e.insitu_burn / 100;
                        }
                    } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Skimmer") {
                        if (!_.isUndefined(el.attributes.efficiency)){
                            el.attributes.efficiency = e.skimming / 100;
                        }
                    }
                });

            webgnome.model.save(null, {validate: false});
        },

        reassessRisk: function(){
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
            var t = surfaceRI+columnRI+shorelineRI;

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
            var tc = ri.surface * surface + ri.column * column + ri.shoreline * shoreline;
            var benefit = (1 - tc) * this.benefitGauge.maxValue;

            // update ui
            this.$('#surface').html((surface).toFixed(3));
            this.$('#column').html((column).toFixed(3));
            this.$('#shoreline').html((shoreline).toFixed(3));

            this.benefitGauge.set(benefit);
        },

        inputValid: function(){
            if (!this.model.isValid()) {
                this.error('Error!', this.model.validationError);
                this.$('#era-tuning-link').addClass('disabled');
                return false;
            } else {
                this.clearError();
                this.$('#era-tuning-link').removeClass('disabled');
            }
        },

        store: function() {
            this.model.save();
            this.close();
        },

        close: function() {
            FormModal.prototype.close.call(this);
        }

    });

    return riskForm;
});
