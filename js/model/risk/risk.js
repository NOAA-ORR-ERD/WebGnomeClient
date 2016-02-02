define([
    'underscore',
    'backbone',
    'moment',
    'nucos'
], function(_, Backbone, moment, nucos){
    var risk = Backbone.Model.extend({
        url: '/',

        defaults: {
            'depth': 20,
            'assessmentTime': 0,

            efficiency: {
                'Skimming': null,
                'Dispersion': null,
                'Burn': null
            },

            'surface': 1/3,
            'column': 1/3,
            'shoreline': 1/3,

            units: {
                'depth': 'm'
            },

            slopes : {
                'Skimming': null,
                'Dispersion': null,
                'Burn': null
            }
        },

        initialize: function(options){
            Backbone.Model.prototype.initialize.call(this, options);
            this.fetch();
            var attrs = this.attributes;

            if (!_.isUndefined(webgnome.model) && !_.isUndefined(webgnome.mass_balance)){
                this.updateEfficiencies();
                this.deriveAssessmentTime();
                var masses = this.getMasses();
                this.setSlopes(masses);
            }
        },

        deriveAssessmentTime: function(){
            var start_time = moment(webgnome.model.get('start_time'));
            var duration = webgnome.model.get('duration');
            var end_time = moment(start_time.add(duration, 's'));

            this.set('assessmentTime', end_time.format(webgnome.config.date_format.moment));
            this.save();
        },

        updateEfficiencies: function(){
            var eff = {};
            _.each(webgnome.model.get('weatherers').models, function(el, idx){
                    if (el.get('obj_type') === "gnome.weatherers.cleanup.ChemicalDispersion") {
                        if (!_.isUndefined(el.get('efficiency'))){
                            eff.Dispersion = el.get('efficiency');
                        }
                    } else if (el.get('obj_type') === "gnome.weatherers.cleanup.Burn") {
                        if (!_.isUndefined(el.get('efficiency'))){
                            eff.Burn = el.get('efficiency');
                        }
                    } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Skimmer") {
                        if (!_.isUndefined(el.get('efficiency'))){
                            eff.Skimming = el.get('efficiency');
                        }
                    }
                });
            this.set('efficiency', eff);
        },

        convertMass: function(quantity) {
            var unit = webgnome.model.get('spills').at(0).get('units');
            var volumeUnits = ['bbl', 'gal', 'm^3'];
            var mass;

            if (volumeUnits.indexOf(unit) > -1) {
                var oilConverter = new nucos.OilQuantityConverter();
                var api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
                mass = oilConverter.Convert(quantity, unit, api, "API degree", "kg");
            } else {
                mass = nucos.convert("Mass", unit, "kg", quantity);
            }

            return mass;
        },

        getMasses: function(){
            var naturalDispersion = 0;
            var chemicalDispersion = 0;
            var masses = {
                surface: 0,
                shoreline: 0,
                column: 0,
                remaining: 0,
                naturalDispersion: 0,
                chemicalDispersion: 0,
                total: 0,
                netRemoved: 0
            };

            var eff = this.get('efficiency');
            var balance = webgnome.mass_balance;
            for (var i = 0; i < balance.length; i++) {
                var balanceIndex = balance[i].data.length - 1;
                var data = balance[i].data[balanceIndex];
                if (balance[i].name.toUpperCase() === 'FLOATING') {
                    masses.surface = this.convertMass(data[1]);
                }
                else if (balance[i].name.toUpperCase() === 'BEACHED' || balance[i].name.toUpperCase() === 'OBSERVED_BEACHED') {
                    masses.shoreline = this.convertMass(data[1]);
                }
                else if (balance[i].name.toUpperCase() === 'CHEM_DISPERSED') {
                    masses.chemicalDispersion = this.convertMass(data[1]);
                }
                else if (balance[i].name.toUpperCase() === 'NATURAL_DISPERSION'){
                    masses.naturalDispersion = this.convertMass(data[1]);
                }
                else if (balance[i].name.toUpperCase() === 'SKIMMED'){
                    masses.skimmed = this.convertMass(data[1]);
                    masses.netRemoved += masses.skimmed;
                }
                else if (balance[i].name.toUpperCase() === 'BURNED'){
                    masses.burned = this.convertMass(data[1]);
                    masses.netRemoved += masses.burned;
                }
                else if (balance[i].name.toUpperCase() === 'AMOUNT_RELEASED'){
                    var mass = this.convertMass(data[1]);
                    this.set('total', mass);
                    masses.total = mass;
                }
                else if (balance[i].name.toUpperCase() === 'EVAPORATED') {
                    masses.evaporated = this.convertMass(data[1]);
                    masses.netRemoved += masses.evaporated;
                }
            }

            masses.column = masses.naturalDispersion + masses.chemicalDispersion;

            var total = (masses.shoreline + masses.surface + masses.column + masses.netRemoved) / masses.total;

            if (Object.keys(this.get('slopes')).length !== 0) {
                var slopes = this.get('slopes');

                if (slopes.Skimming) {
                    var skimmedRemoved = eff.Skimming * slopes.Skimming - masses.skimmed;

                    if (skimmedRemoved > 0) {
                        if (masses.surface > skimmedRemoved) {
                            masses.surface -= skimmedRemoved;
                        } else {
                            masses.shoreline -= skimmedRemoved;
                        }
                    } else {
                        masses.surface += Math.abs(skimmedRemoved);
                    }
                    masses.skimmed += skimmedRemoved;
                }

                if (slopes.Dispersion) {
                    var dispersionRemoved = eff.Dispersion * slopes.Dispersion - masses.chemicalDispersion;

                    if (dispersionRemoved > 0) {
                        if (masses.surface > dispersionRemoved) {
                            masses.surface -= dispersionRemoved;
                        } else {
                            masses.shoreline -= dispersionRemoved;
                        }
                    } else {
                        masses.surface += Math.abs(dispersionRemoved);
                    }
                    masses.chemicalDispersion += dispersionRemoved;
                    masses.column += dispersionRemoved;
                }
 
                if (slopes.Burn) {
                    var burnRemoved = eff.Burn * slopes.Burn - masses.burned;

                    if (burnRemoved > 0) {
                        if (masses.surface > burnRemoved) {
                            masses.surface -= burnRemoved;
                        } else {
                            masses.shoreline -= burnRemoved;
                        }
                    } else {
                        masses.surface += Math.abs(burnRemoved);
                    }
                    masses.burned += burnRemoved;
                }
            }

            for (var key in masses) {
                if (masses[key] < 0.01) {
                    masses[key] = 0;
                }
            }

            return masses;
        },

        setSlopes: function(masses) {
            var eff = this.get('efficiency');
            var slopes = {};

            if (eff.Skimming) {
                slopes.Skimming = masses.skimmed / eff.Skimming;
            }

            if (eff.Dispersion) {
                slopes.Dispersion = masses.chemicalDispersion / eff.Dispersion;
            }

            if (eff.Burn) {
                slopes.Burn = masses.burned / eff.Burn;
            }

            this.set('slopes', slopes);
        },

        assessment: function(){
            var units = this.get('units');
            var masses = this.getMasses();

            this.calculateShorelineFract(masses, units);
            this.calculateWaterSurfaceFract(masses, units);
            this.calculateWaterColumnFract(masses, units);
        },

        calculateShorelineFract: function(masses, units){
            var massShorelineFract = masses.shoreline;
            var shorelineLOC = 0.56;
            var fractOfContaminatedSh = massShorelineFract / shorelineLOC;
            this.set('shoreline', fractOfContaminatedSh);
        },

        calculateWaterSurfaceFract: function(masses, units){
            var massOnWaterSurfaceFract = masses.surface;
            var surfaceLOC = 0.01;
            var fractOfContaminatedWs = massOnWaterSurfaceFract / surfaceLOC;
            this.set('surface', fractOfContaminatedWs);
        },

        calculateWaterColumnFract: function(masses, units){
            var massInWaterColumnFract = masses.column;
            var waterColumnLOC = 0.001;
            var fractOfContaminatedWc = massInWaterColumnFract / waterColumnLOC;
            this.set('column', fractOfContaminatedWc);
        },

        calculateBenefit: function(){
            var values = this.get('relativeImportance');
            var netERA, subsurfaceBenefit, shorelineBenefit, surfaceBenefit;
            for (var key in values){
                if (key === 'Subsurface'){
                    subsurfaceBenefit = this.get('column') * (values[key].data / 100);
                } else if (key === 'Shoreline'){
                    shorelineBenefit = this.get('shoreline') * (values[key].data / 100);
                } else if (key === 'Surface'){
                    surfaceBenefit = this.get('surface') * (values[key].data / 100);
                }
            }

            var currentBadness = subsurfaceBenefit + shorelineBenefit + surfaceBenefit;
            var total = this.get('column') + this.get('shoreline') + this.get('surface');

            netERA = currentBadness / total;

            // if (ratioDiff > 0) {
            //     netERA = ratioDiff;
            // } else if (ratioDiff < 0) {
            //     netERA = Math.abs(ratioDiff);
            // } else {
            //     netERA = 0.50;
            // }

            return netERA;
        },

        unitDict: {
            'm^2': 'Area',
            'm': 'Length'
        },

        validateMessageGenerator: function(amount, fromUnits, toUnits){
            var type = this.unitDict[fromUnits];
            var bound = Math.round(nucos.convert(type, fromUnits, toUnits, amount));
            return bound + ' ' + toUnits + '!';
        },

        boundsDict: {
            depth: {
                high: 100,
                low: 5
            }
        },

        validate: function(attrs, options){
            var depth = nucos.convert('Length', attrs.units.depth, 'm', attrs.depth);
            var assessment_time = moment(attrs.assessmentTime).unix();
            if (depth < this.boundsDict.depth.low || attrs.depth === ''){
                return 'Average water depth must be greater than ' + this.validateMessageGenerator(this.boundsDict.depth.low, 'm', attrs.units.depth);
            }
            if (depth > this.boundsDict.depth.high){
                return 'Average water depth must be smaller than ' + this.validateMessageGenerator(this.boundsDict.depth.high, 'm', attrs.units.depth);
            }
        },

        writeGnomeEff: function(){
            for (var key in this.get('efficiency')){
                if (!_.isNull(this.get('efficiency')[key])){
                    var weatheringModel;
                    if (key === 'Dispersion'){
                        weatheringModel = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.ChemicalDispersion'});
                    } else if (key === 'Burn'){
                        weatheringModel = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.Burn'});
                    } else if (key === 'Skimming'){
                        weatheringModel = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.Skimmer'});
                    }
                    if (!_.isUndefined(weatheringModel)){
                        weatheringModel.cascadeEfficiencies(this.get('efficiency')[key]);
                    }
                }
            }
        },

        // OVERRIDES for local storage of model
        fetch: function() {
            this.set(JSON.parse(localStorage.getItem('risk_calculator')));
        },

        save: function(attributes, options) {
            localStorage.setItem('risk_calculator', JSON.stringify(this.toJSON()));
            this.writeGnomeEff();

            if (!_.isUndefined(options) && _.isFunction(options.success)) {
                options.success();
            }
        },

        destroy: function(options) {
            localStorage.removeItem('risk_calculator');
        }

    });

    return risk;
    
});
