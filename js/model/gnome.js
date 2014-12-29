define([
    'underscore',
    'jquery',
    'backbone',
    'moment',
    'model/base',
    'model/map',
    'model/spill',
    'model/environment/tide',
    'model/environment/wind',
    'model/environment/water',
    'model/movers/wind',
    'model/movers/random',
    'model/movers/cats',
    'model/outputters/geojson',
    'model/outputters/weathering',
    'model/weatherers/evaporation',
    'model/weatherers/dispersion',
    'model/weatherers/burn',
    'model/weatherers/skim'
], function(_, $, Backbone, moment,
    BaseModel, MapModel, SpillModel, TideModel, WindModel, WaterModel,
    WindMover, RandomMover, CatsMover,
    GeojsonOutputter, WeatheringOutputter,
    EvaporationWeatherer, DispersionWeatherer, BurnWeatherer, SkimWeatherer){
    var gnomeModel = BaseModel.extend({
        url: '/model',
        ajax: [],
        model: {
            spills: {
                'gnome.spill.spill.Spill': SpillModel
            },
            map: MapModel,
            environment: {
                'gnome.environment.wind.Wind': WindModel,
                'gnome.environment.tide.Tide': TideModel,
                'gnome.environment.environment.Water': WaterModel
            },
            movers: {
                'gnome.movers.wind_movers.WindMover': WindMover,
                'gnome.movers.random_movers.RandomMover': RandomMover,
                'gnome.movers.current_movers.CatsMover': CatsMover
            },
            outputters: {
                'gnome.outputters.geo_json.GeoJson': GeojsonOutputter,
                'gnome.outputters.weathering.WeatheringOutput': WeatheringOutputter
            },
            weatherers: {
                'gnome.weatherers.evaporation.Evaporation': EvaporationWeatherer,
                'gnome.weatherers.cleanup.Dispersion': DispersionWeatherer,
                'gnome.weatherers.cleanup.Burn': BurnWeatherer,
                'gnome.weatherers.cleanup.Skimmer': SkimWeatherer
            }
        },

        sync: function(method, model, options){
            // because of the unique structure of the gnome model, it's relation to other child object
            // via ids, we need to dehydrate any child objects into just an id before sending it to the
            // server.
            if(_.indexOf(['update'], method) != -1){
                for(var key in model.model){
                    if(model.get(key)){
                        if(model.get(key) instanceof Backbone.Collection){
                            var array = model.get(key).toArray();
                            model.set(key, [], {silent: true});
                            if(array.length > 0){
                                _.each(array, function(element){
                                    if(!_.isUndefined(element.get('id'))){
                                        model.get(key).push({id: element.get('id'), obj_type: element.get('obj_type')});
                                    } else {
                                        model.get(key).push(element);
                                    }
                                });
                            }
                        } else {
                            model.set(key, {id: model.get(key).get('id'), obj_type: model.get(key).get('obj_type')}, {silent: true});
                        }
                    }
                }
            }
            return BaseModel.prototype.sync.call(this, method, model, options);
        },

        parse: function(response){
            // model needs a special parse function to turn object id's into objects
            for(var key in this.model){
                if(response[key]){
                    var embeddedClass = this.model[key];
                    var embeddedData = response[key];

                    if(_.isArray(embeddedData)){
                        response[key] = new Backbone.Collection();
                        // if the embedded class isn't an object it can only have one type of object in
                        // the given collection, so set it.

                        if(!_.isObject(embeddedClass)){
                            for(var obj in embeddedData){
                                response[key].add(new embeddedClass(embeddedData[obj], {parse: true, silent: true}));
                            }
                        } else {
                            // the embedded class is an object therefore we can assume
                            // that the collection can have several types of objects
                            // I.E. environment with wind and tide, figure out which one we have
                            // by looking at it's obj_type and cast it appropriatly.

                            for(var obj in embeddedData){
                                // console.log(new embeddedClass[embeddedData[obj].obj_type](embeddedData[obj], {parse: true, silent: true}));
                                if(_.isFunction(embeddedClass[embeddedData[obj].obj_type])){
                                    response[key].add(new embeddedClass[embeddedData[obj].obj_type](embeddedData[obj], {parse: true, silent: true}));
                                } else {
                                    response[key].add(new Backbone.Model(embeddedData[obj], {parse: true, silent: true}));
                                }
                            }
                        }
                    } else {
                        response[key] = new embeddedClass(embeddedData, {parse: true, silent: true});
                    }
                }
            }
            return response;
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

            if (Math.round(days) != days) {
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

        resetLocation: function(){
            // clear any location relevant objects from the model.

            // reset movers only preserving the wind at the moment.
            var movers = this.get('movers');
            var windMovers = movers.where({obj_type: 'gnome.movers.wind_movers.WindMover'});
            movers.reset(windMovers);

            // remove the map
            var map = new MapModel({obj_type: 'gnome.map.GnomeMap'});
            map.save(null, {
                success: _.bind(function(){
                    this.set('map', map);
                    // remove any environment other than wind and water
                    var environment = this.get('environment');
                    var winds = environment.where({obj_type: 'gnome.environment.wind.Wind'});
                    var water = environment.where({obj_type: 'gnome.environment.environment.Water'});
                    environment.reset(winds);
                    environment.add(water);
                    
                    this.trigger('reset:location');
                }, this)
            });
        },

        setup: function(cb){
            this.save(null, {
                validate: false,
                success: _.bind(function(){
                    var gout = new GeojsonOutputter();
                    gout.save(null, {
                        validate: false,
                        success: _.bind(function(){
                            this.get('outputters').add(gout);
                            var wout = new WeatheringOutputter();
                            wout.save(null, {
                                validate: false,
                                success: _.bind(function(){
                                    this.get('outputters').add(wout);
                                    var evaporation = new EvaporationWeatherer();
                                    evaporation.save(null, {
                                        success: _.bind(function(model, response, options){
                                            this.get('weatherers').add(evaporation);
                                            var dispersion = new DispersionWeatherer();
                                            dispersion.set('name', '_natural');
                                            dispersion.save(null, {
                                                success: _.bind(function(model, repsonse, options){
                                                    this.get('weatherers').add(dispersion);
                                                    this.save({start_time: moment().format('YYYY-MM-DDThh:mm:ss')}, {
                                                        validate: false,
                                                        success: _.bind(function(model, response, options){
                                                            if(_.isFunction(cb)){
                                                                cb();
                                                            }
                                                        }, this)
                                                    });
                                                }, this)
                                            });
                                        }, this)
                                    });
                                }, this)
                            });
                        }, this)
                    });
                }, this)
            });
        },

        mergeModel: function(model){
            // merge a given model with this model.
            // merge collections
            // set map from given model only if this model doesn't have one.

            if (this.get('map')) {
                this.set('map', model.get('map'));
            }

            this.get('spills').add(model.get('spills').models);
            this.get('environment').add(model.get('environment').models);
            this.get('movers').add(model.get('movers').models);
            this.get('weatherers').add(model.get('weatherers').models);
        }
    });
    
    return gnomeModel;
});