define([
    'underscore',
    'jquery',
    'backbone',
    'moment',
    'model/base',
    'model/cache',
    'model/map',
    'model/spill',
    'model/environment/tide',
    'model/environment/wind',
    'model/environment/water',
    'model/environment/waves',
    'model/movers/wind',
    'model/movers/random',
    'model/movers/cats',
    'model/movers/ice',
    'model/outputters/trajectory',
    'model/outputters/weathering',
    'model/outputters/current',
    'model/outputters/ice',
    'model/weatherers/evaporation',
    'model/weatherers/dispersion',
    'model/weatherers/emulsification',
    'model/weatherers/burn',
    'model/weatherers/skim',
    'model/weatherers/natural_dispersion',
    'model/weatherers/manual_beaching',
    'model/weatherers/base',
    'model/risk/risk'
], function(_, $, Backbone, moment,
    BaseModel, Cache, MapModel, SpillModel, TideModel, WindModel, WaterModel, WavesModel,
    WindMover, RandomMover, CatsMover, IceMover,
    TrajectoryOutputter, WeatheringOutputter, CurrentOutputter, IceOutputter,
    EvaporationWeatherer, DispersionWeatherer, EmulsificationWeatherer, BurnWeatherer, SkimWeatherer, NaturalDispersionWeatherer, BeachingWeatherer, BaseWeatherer, RiskModel){
    'use strict';
    var gnomeModel = BaseModel.extend({
        url: '/model',
        ajax: [],
        ref_hash: {},
        model: {
            spills: {
                'gnome.spill.spill.Spill': SpillModel
            },
            map: MapModel,
            environment: {
                'gnome.environment.wind.Wind': WindModel,
                'gnome.environment.tide.Tide': TideModel,
                'gnome.environment.environment.Water': WaterModel,
                'gnome.environment.waves.Waves': WavesModel,
            },
            movers: {
                'gnome.movers.wind_movers.WindMover': WindMover,
                'gnome.movers.random_movers.RandomMover': RandomMover,
                'gnome.movers.current_movers.CatsMover': CatsMover,
                'gnome.movers.current_movers.IceMover': IceMover
            },
            outputters: {
                'gnome.outputters.geo_json.TrajectoryGeoJsonOutput': TrajectoryOutputter,
                'gnome.outputters.weathering.WeatheringOutput': WeatheringOutputter,
                'gnome.outputters.geo_json.CurrentGeoJsonOutput': CurrentOutputter,
                'gnome.outputters.geo_json.IceGeoJsonOutput': IceOutputter
            },
            weatherers: {
                'gnome.weatherers.evaporation.Evaporation': EvaporationWeatherer,
                'gnome.weatherers.cleanup.ChemicalDispersion': DispersionWeatherer,
                'gnome.weatherers.emulsification.Emulsification': EmulsificationWeatherer,
                'gnome.weatherers.cleanup.Burn': BurnWeatherer,
                'gnome.weatherers.cleanup.Skimmer': SkimWeatherer,
                'gnome.weatherers.natural_dispersion.NaturalDispersion': NaturalDispersionWeatherer,
                'gnome.weatherers.manual_beaching.Beaching': BeachingWeatherer,
                'gnome.weatherers.spreading.FayGravityViscous': BaseWeatherer,
                'gnome.weatherers.weathering_data.WeatheringData': BaseWeatherer
            }
        },

        defaults: function(){
            return {
                obj_type: 'gnome.model.Model',
                time_step: 900,
                start_time: moment().format('YYYY-MM-DDTHH:00:00'),
                duration: 86400,
                map: new MapModel(),
                outputters: new Backbone.Collection([
                    new TrajectoryOutputter(),
                    new WeatheringOutputter(),
                    new CurrentOutputter(),
                    new IceOutputter()
                ]),
                weatherers: new Backbone.Collection([
                    new EvaporationWeatherer(),
                    new NaturalDispersionWeatherer({name: '_natural'}),
                    new EmulsificationWeatherer()
                ]),
                movers: new Backbone.Collection(),
                environment: new Backbone.Collection(),
                spills: new Backbone.Collection()
            };
        },

        initialize: function(options){
            // BaseModel.prototype.initialize.call(this, options);
            webgnome.cache = new Cache(null, this);
            webgnome.obj_ref = {};
            this.addListeners();
        },

        addListeners: function(){
            this.get('environment').on('change add remove', this.environmentChange, this);
            this.get('movers').on('change add remove', this.moversChange, this);
            this.get('spills').on('change add remove', this.spillsChange, this);
            this.get('weatherers').on('change add remove', this.weatherersChange, this);
            this.get('outputters').on('change add remove', this.outputtersChange, this);
            this.on('change:map', this.validateSpills, this);
            this.on('change:map', this.addMapListeners, this);
        },

        addMapListeners: function(){
            this.get('map').on('change', this.mapChange, this);
        },

        mapChange: function(child){
            this.validateSpills(child);
            this.childChange('map', child);
        },

        environmentChange: function(child){
            this.childChange('environment', child);
        },

        moversChange: function(child){
            this.childChange('movers', child);
        },

        spillsChange: function(child){
            this.childChange('spills', child);
        },

        weatherersChange: function(child){
            this.childChange('weatherers', child);
        },

        outputtersChange: function(child){
            this.childChange('outputters', child);
        },

        childChange: function(attr, child){
            if(!_.isObject(this.changed[attr])){
                this.changed[attr] = {};
            }
            this.changed[attr][child.get('id')] = child.changed;
            this.trigger('change', this);
        },

        validateSpills: function() {
            var spills = this.get('spills');
            var spillNames = '';
            for (var i = 0; i < spills.length; i++){
                if (!spills.at(i).isValid()){
                    spillNames += spills.at(i).get('name') + ' ';
                }
            }
            return spillNames;
        },

        validate: function(attrs, options) {
            // if(attrs.duration <= 0 || isNaN(attrs.duration)){
            //     return 'Duration values should be numbers only and greater than 0.';
            // }

            if(attrs.duration <= 0){
                return 'Duration values should be positive values.';
            }

            if(isNaN(attrs.duration)){
                return 'Duration values should be numbers only.';
            }

            if (!isNaN(attrs.time_step)){

                if(attrs.time_step % 60 !== 0){
                    return 'Time step must be a whole number.';
                }

                if(attrs.time_step <= 0){
                    return 'Time step must be a positive number.';
                }
            }
            else {
                return 'Time step values should be numbers only.';
            }

            if (this.validateSpills() !== ''){
                return this.validateSpills();
            }


            // if (attrs.map_id === null) {
            //     return 'Model requires a map.';
            // }

            // if (attrs.movers === null) {
            //     return 'Model doesn\'t have any movers.';
            // }

            // if (attrs.spills === null) {
            //     return 'Model requires at least one spill.';
            // }

            // if (attrs.environment === null) {
            //     return 'Model doesn\'t have an environment.';
            // }

            // if (attrs.start_time === null || attrs.duration) {
            //     return 'Model needs both start time and duration.';
            // }
        },

        formatDuration: function() {
            var duration = this.get('duration');

            var hours = duration / 3600;
            var days = hours / 24;

            if (Math.round(days) !== days) {
                if (days < 1){
                    days = 0;
                } else {
                    days = parseInt(days, 10);
                    hours = hours - (days * 24);
                }
            } else {
                hours = 0;
            }
            return {days: days, hours: hours};
        },

        toTree: function(){
            var tree = {};
            var millisecsDur = this.get('duration') * 1000;
            var millisecsTime = this.get('time_step') * 1000;
            var duration = moment.duration(millisecsDur).asHours();
            var timeStepTime = moment.duration(millisecsTime).asMinutes();
            var map = this.get('map');
            var movers = this.get('movers');
            var environment = this.get('environment');
            var weatherers = this.get('weatherers');
            var spills = this.get('spills');
            var attrs = [];
            var startTime = moment(this.get('start_time')).format('lll');

            timeStepTime += (timeStepTime === 1) ? ' minute' : ' minutes';

            duration += (duration === 1) ? ' hour' : ' hours';

            attrs.push({title: 'Start Time: ' + startTime, key: 'Start Time',
                         obj_type: this.get('start_time'), action: 'edit', object: this});

            attrs.push({title: 'Duration: ' + duration, key: 'Duration',
                         obj_type: this.get('obj_type'), action: 'edit', object: this});

            attrs.push({title: 'Time Step: ' + timeStepTime, key: 'Time Step',
                         obj_type: this.get('time_step'), action: 'edit', object: this});

            if(map){
                attrs.push({title: 'Map:', children: map.toTree(), expanded: true, obj_type: map.get('obj_type'), action: 'new'});
            }

            if(movers){
                attrs.push({title: 'Movers:', children: movers.toTree(), expanded: true, obj_type: movers.get('obj_type'), action: 'new'});
            }

            if(environment){
                attrs.push({title: 'Environment:', children: environment.toTree(), expanded: true, obj_type: environment.get('obj_type'), action: 'new'});
            }

            if(weatherers){
                attrs.push({title: 'Weatherers:', children: weatherers.toTree(), expanded: true, obj_type: weatherers.get('obj_type'), action: 'new'});
            }

            if(spills){
                attrs.push({title: 'Spills:', children: spills.toTree(), expanded: true, obj_type: spills.get('obj_type'), action: 'new'});
            }

            return attrs;
        },

        isValidAdios: function(){
            return false;
        },

        resetLocation: function(cb){
            // clear any location relevant objects from the model.

            // reset movers only preserving the wind at the moment.
            var movers = this.get('movers');
            var windMovers = movers.where({obj_type: 'gnome.movers.wind_movers.WindMover'});
            movers.reset(windMovers);

            // remove any environment other than wind and water
            var environment = this.get('environment');
            var winds = environment.where({obj_type: 'gnome.environment.wind.Wind'});
            var water = environment.where({obj_type: 'gnome.environment.environment.Water'});
            var waves = environment.where({obj_type: 'gnome.environment.waves.Waves'});
            environment.reset(winds);
            environment.add(water);
            environment.add(waves);

            // drop all of the currents from current outputter
            this.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.CurrentGeoJsonOutput'}).get('current_movers').reset();

            // drop all of the ice movers from the ice mover outputter
            this.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput'}).get('ice_movers').reset();

            // remove the map
            var map = new MapModel({obj_type: 'gnome.map.GnomeMap'});
            this.set('map', map, {silent: true});
            this.save(null, {validate: false, success: cb});
        },

        updateWaves: function(cb){
            var environment = this.get('environment');
            var wind = environment.findWhere({obj_type: 'gnome.environment.wind.Wind'});
            var water = environment.findWhere({obj_type: 'gnome.environment.environment.Water'});

            if(wind && water){

                var waves = environment.findWhere({obj_type: 'gnome.environment.waves.Waves'});
                if(_.isUndefined(waves)){
                    waves = new WavesModel();
                    environment.add(waves);
                }

                waves.set('wind', wind);
                waves.set('water', water);
                waves.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        var emul = this.get('weatherers').findWhere({obj_type: 'gnome.weatherers.emulsification.Emulsification'});
                        if(!emul){
                            emul = new EmulsificationWeatherer();
                            this.get('weatherers').add(emul);
                        }
                        emul.set('waves', waves);

                        var natural_dispersion = this.get('weatherers').findWhere({obj_type: 'gnome.weatherers.natural_dispersion.NaturalDispersion'});
                        if(!natural_dispersion){
                            natural_dispersion = new NaturalDispersionWeatherer();
                            this.get('weatherers').add(natural_dispersion);
                        }
                        natural_dispersion.set('waves', waves);

                        this.save();
                    }, this)
                });
            } else {
                cb();
            }
        },

        updateOutputters: function(cb){
            // temp add first cats current to the current outputter
            var currents = this.get('movers').where({
                obj_type: 'gnome.movers.current_movers.CatsMover'
            });

            if(currents.length > 0){
                var outputter = this.get('outputters').findWhere({
                    obj_type: 'gnome.outputters.geo_json.CurrentGeoJsonOutput'
                });
                if(outputter){
                    outputter.get('current_movers').add(currents, {merge: true});
                } else {
                    outputter = new CurrentOutputter({current_movers: currents});
                    this.get('outputters').add(outputter);
                }

                this.save(null, {validate: false}).always(cb);
            }
        },

        updateBurn: function(){
            
        }
    });
    
    return gnomeModel;
});
