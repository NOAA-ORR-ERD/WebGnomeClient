define([
    'underscore',
    'backbone',
    'moment',
    'nucos'
], function(_, Backbone, moment, nucos){
    var risk = Backbone.Model.extend({
        url: '/',

        defaults: {
            'depth': 0,
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
            }
        },

        initialize: function(options){
            Backbone.Model.prototype.initialize.call(this, options);
            this.fetch();
            this.on('change', this.save, this);
            var attrs = this.attributes;

            if (!_.isUndefined(webgnome.model)){
                this.updateEfficiencies();
                this.deriveAssessmentTime();
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
                total: 0
            };
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
                else if (balance[i].name.toUpperCase() === 'CHEMICAL_DISPERSION') {
                    chemicalDispersion = this.convertMass(data[1]);
                }
                else if (balance[i].name.toUpperCase() === 'NATURAL_DISPERSION'){
                    naturalDispersion = this.convertMass(data[1]);
                }
                else if (balance[i].name.toUpperCase() === 'AMOUNT_RELEASED') {
                    masses.total = this.convertMass(data[1]);
                }
            }

            masses.column = naturalDispersion + chemicalDispersion;
            return masses;
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
            var shorelineBadness = 0.5;
            var fractOfContaminatedSh = massShorelineFract * shorelineBadness;
            this.set('shoreline', fractOfContaminatedSh);
        },

        calculateWaterSurfaceFract: function(masses, units){
            var massOnWaterSurfaceFract = masses.surface;
            var surfaceBadness = 0.01;
            var fractOfContaminatedWs = massOnWaterSurfaceFract * surfaceBadness;
            this.set('surface', fractOfContaminatedWs);
        },

        calculateWaterColumnFract: function(masses, units){
            var massInWaterColumnFract = masses.column;
            var waterColumnBadness = 0.001;
            var fractOfContaminatedWc = massInWaterColumnFract * waterColumnBadness;
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

            netERA = 1 - (subsurfaceBenefit + shorelineBenefit + surfaceBenefit);

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
                low: 1
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
        },

        destroy: function(options) {
            localStorage.removeItem('risk_calculator');
        }

    });

    return risk;
    
});
