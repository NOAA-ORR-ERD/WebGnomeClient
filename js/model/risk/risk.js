define([
    'underscore',
    'backbone',
    'moment',
    'nucos',
    'model/no_cleanup_step'
], function(_, Backbone, moment, nucos, NoCleanupStep){
    var risk = Backbone.Model.extend({
        url: '/',

        defaults: {
            'assessmentTime': 0,
            'depth': 20,
            'distance': 5,
            'depth_d': 20,
            'distance_d': 5,

            efficiency: {
                'Skimmer': null,
                'ChemicalDispersion': null,
                'Burn': null
            },

            origEff: {
                'Skimmer': null,
                'ChemicalDispersion': null,
                'Burn': null
            },

            'surface': 1/3,
            'column': 1/3,
            'shoreline': 1/3,

            'active_cleanup': null,

            units: {
                'depth': 'm',
                'distance': 'km'
            },

            slopes : {
                'Skimmer': null,
                'ChemicalDispersion': null,
                'Burn': null
            }
        },

        initialize: function(options){
            Backbone.Model.prototype.initialize.call(this, options);
            this.fetch();
            var attrs = this.attributes;

            if (!_.isUndefined(webgnome.model) && !_.isUndefined(webgnome.mass_balance)){
                this.updateEfficiencies();
                this.cloneEfficiencies();
                this.deriveAssessmentTime();
                var masses = this.getMasses();
                this.setSlopes(masses);
                this.fetchNoCleanupData();
            }
        },

        fetchNoCleanupData: function(){
            var cleanupData = new NoCleanupStep();
            cleanupData.fetch({
                success: _.bind(function(model) {
                    var noCleanupMasses = model.get('WeatheringOutput').nominal;
                    this.set('column_noclean', noCleanupMasses.natural_dispersion);
                    this.set('surface_noclean', noCleanupMasses.floating);
                    this.set('shoreline_noclean', noCleanupMasses.beached);
                    this.trigger('loaded');
                }, this)
            });
        },

        deriveAssessmentTime: function(){
            var start_time = moment(webgnome.model.get('start_time'));
            var duration = webgnome.model.get('duration');
            var end_time = moment(start_time.add(duration, 's'));

            this.set('assessmentTime', end_time.format(webgnome.config.date_format.moment));
            this.save();
        },

        cloneEfficiencies: function() {
            var clone = _.clone(this.get('efficiency'));
            this.set('origEff', clone);
        },

        updateEfficiencies: function(){
            var eff = {};
            _.each(webgnome.model.get('weatherers').models, function(el, idx){
                    if (el.get('obj_type') === "gnome.weatherers.cleanup.ChemicalDispersion") {
                        if (!_.isUndefined(el.get('efficiency'))){
                            eff.ChemicalDispersion = el.get('efficiency');
                        }
                    } else if (el.get('obj_type') === "gnome.weatherers.cleanup.Burn") {
                        if (!_.isUndefined(el.get('efficiency'))){
                            eff.Burn = el.get('efficiency');
                        }
                    } else if (el.attributes.obj_type === "gnome.weatherers.cleanup.Skimmer") {
                        if (!_.isUndefined(el.get('efficiency'))){
                            eff.Skimmer = el.get('efficiency');
                        }
                    }
                });
            this.set('efficiency', eff);
        },

        convertMass: function(quantity, units) {
            var unit;
            if (_.isUndefined(unit)) {
                unit = webgnome.model.get('spills').at(0).get('units');
            } else {
                unit = units;
            }
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

                if (slopes.Skimmer && this.get('active_cleanup') === 'Skimmer') {
                    var skimmedRemoved = eff.Skimmer * slopes.Skimmer - masses.skimmed;

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

                if (slopes.ChemicalDispersion && this.get('active_cleanup') === 'ChemicalDispersion') {
                    var dispersionRemoved = eff.ChemicalDispersion * slopes.ChemicalDispersion - masses.chemicalDispersion;

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
 
                if (slopes.Burn && this.get('active_cleanup') === 'Burn') {
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
                    console.log(masses);
                }
            }

            for (var key in masses) {
                if (masses[key] < 0.01) {
                    masses[key] = 0;
                }
            }

            return masses;
        },

        getMaxCleanup: function() {
            var maxes = {
                'Skimmer': 0,
                'Burn': 0,
                'ChemicalDispersion': 0
            };
            var cleanups = webgnome.model.get('weatherers').filter(function(model) {
                if (model.get('obj_type').indexOf('cleanup') > -1) {
                    return true;
                }
                return false;
            });

            for (var i = 0; i < cleanups.length; i++) {
                var str = cleanups[i].parseObjType();
                maxes[str] = cleanups[i].getMaxCleanup();
            }

            return maxes;
        },

        setSlopes: function(masses) {
            var eff = this.get('efficiency');
            var slopes = {};
            var maxes = this.getMaxCleanup();

            if (eff.Skimmer) {
                slopes.Skimmer = maxes.Skimmer;
            }

            if (eff.ChemicalDispersion) {
                slopes.ChemicalDispersion = maxes.ChemicalDispersion;
            }

            if (eff.Burn) {
                slopes.Burn = maxes.Burn;
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
            this.set('shoreline', masses.shoreline);
        },

        calculateWaterSurfaceFract: function(masses, units){
            this.set('surface', masses.surface);
        },

        calculateWaterColumnFract: function(masses, units){
            this.set('column', masses.column);
        },

        calculateBenefit: function(){
            var values = this.get('relativeImportance');
            var netERA, subsurfaceBenefit, shorelineBenefit, surfaceBenefit;
            var subsurfaceBenefit_noclean, surfaceBenefit_noclean, shorelineBenefit_noclean, netERA_clean, netERA_noclean;

            for (var key in values){
                if (key === 'Subsurface'){
                    var subSurfaceFactor = values[key].data / 100;
                    subsurfaceBenefit = (this.get('column') / this.get('total')) * subSurfaceFactor;
                    subsurfaceBenefit_noclean = (this.get('column_noclean') / this.get('total')) * subSurfaceFactor;
                } else if (key === 'Shoreline'){
                    var shoreFactor = values[key].data / 100;
                    shorelineBenefit = (this.get('shoreline') / this.get('total')) * shoreFactor;
                    shorelineBenefit_noclean = (this.get('shoreline_noclean') / this.get('total')) * shoreFactor;
                } else if (key === 'Surface'){
                    var surfaceFactor = values[key].data / 100;
                    surfaceBenefit = (this.get('surface') / this.get('total')) * surfaceFactor;
                    surfaceBenefit_noclean = (this.get('surface_noclean') / this.get('total')) * surfaceFactor;
                }
            }

            netERA_clean = 1 - (shorelineBenefit + subsurfaceBenefit + surfaceBenefit);
            netERA_noclean = 1 - (shorelineBenefit_noclean + subsurfaceBenefit_noclean + surfaceBenefit_noclean);

            netERA = (netERA_clean - netERA_noclean + 1) / 2;

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
                    if (key === 'ChemicalDispersion'){
                        weatheringModel = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.ChemicalDispersion'});
                    } else if (key === 'Burn'){
                        weatheringModel = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.cleanup.Burn'});
                    } else if (key === 'Skimmer'){
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
            return new Promise(function(res, rej){ res(); });
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
