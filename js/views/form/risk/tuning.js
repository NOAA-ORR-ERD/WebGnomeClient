define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryui/core',
    'views/modal/form',
    'text!templates/risk/tuning.html',
    'text!templates/risk/relativeimportance.html',
    'relativeimportance',
    'flot'
], function($, _, Backbone, jqueryui, FormModal, RiskTemplate, RelativeImportanceTemplate, RelativeImportance) {
    var riskForm = FormModal.extend({
        className: 'modal fade form-modal risk-form tuning',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',

        events: function(){
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
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

            this.body = _.template(RiskTemplate, {
                surface: this.model.get('surface').toFixed(3),
                column: this.model.get('column').toFixed(3),
                shoreline: this.model.get('shoreline').toFixed(3),
                showDispersant: showDispersant,
                showBurn: showBurn,
                showSkimming: showSkimming
            });

            FormModal.prototype.render.call(this, options);

            this.createSlider('#skimming .slider', this.model.get('efficiency').skimming);
            this.createSlider('#dispersant .slider', this.model.get('efficiency').dispersant);
            this.createSlider('#insituburn .slider', this.model.get('efficiency').insitu_burn);

            this.relativeImp = new RelativeImportance('importance',
                {   sideLength: 150,
                    point1: {label: 'column'},
                    point2: {label: 'surface'},
                    point3: {label: 'shoreline'},
                    callback: _.bind(this.relativeImportancePercent, this)
                });

            this.relativeImp.draw();

            this.on('relativeRendered', _.bind(function(){
                this.renderPie(this.pieData);
            }, this));

            this.trigger('relativeRendered');
        },

        relativeImportancePercent: function(data){
            this.$('.relative-importance').html('');
            var relativeimportance = _.template(RelativeImportanceTemplate, {
                'data': data
            });
            this.$('.relative-importance').html(relativeimportance);
            this.pieData = data;
            this.trigger('relativeRendered');

            this.model.set('relativeImportance', this.pieData);
        },

        formatPieData: function(data){
            var dataArray = [];

            for (var key in data){
                var obj = {
                    label: key,
                    'data': data[key].data,
                    color: data[key].color
                };
                dataArray.push(obj);
            }
            return dataArray;
        },

        renderPie: function(data){
            var plotData = this.formatPieData(data);
            $.plot('#pie-importance .chart', plotData, {
                series: {
                    pie: {
                        show: true,
                        radius: 3 / 4,
                        label: {
                            formatter: function(label, series){
                                return '<div><span style="background-color:' + series.color + ';"></span>' + label + '<br>' + Math.round(series.data[0][1]) + '%</div>';
                            },
                            show: true,
                            radius: 6 / 10
                        }
                    }
                },
                legend: {
                    show: false
                }
            });
            this.updateBenefit();
        },

        updateBenefit: function(){
            var benefit = Math.round(this.model.calculateBenefit() * 100);
            this.$('google-chart').attr('data', '[["Label", "Value"], ["Benefit", ' + benefit + ']]');
        },

        createSlider: function(selector, value){
            this.$(selector).slider({
                    max: 100,
                    min: 0,
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$(selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$(selector + ' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.reassessRisk();
                        }, this)
            });
        },

        reassessRisk: function(){
            var skimming = this.$('#skimming .slider').slider('value');
            var dispersant = this.$('#dispersant .slider').slider('value');
            var insitu_burn = this.$('#insituburn .slider').slider('value');

            // set model
            var eff = this.model.get('efficiency');
            eff.skimming = skimming;
            eff.dispersant = dispersant;
            eff.insitu_burn = insitu_burn;

            this.model.set('efficiency', eff);

            // assess model
            this.model.assessment();
        }

    });

    return riskForm;
});
