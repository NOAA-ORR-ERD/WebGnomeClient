define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/waves'
], function(_, Backbone, BaseModel, WavesModel){
    'use strict';
    var defaultObjs = Backbone.Model.extend({
        /*
        Object that listens to the model and handles default references for
        environment objects. Also manages the Waves object for the Model
        */
        defaults: {
            'wind': null,
            'water': null,
            'waves': null,
            'windSpecified': false,
            'waterSpecified': false,
            'hasSubstance': false
        },

        initialize: function(options, model) {
            this.set(this.defaults);
            this.listenTo(model, 'fetched', this.fetchHandler);
            this.listenTo(model.get('environment'), 'add', this.addObj);
            this.listenTo(model.get('environment'), 'remove', this.removeObj);
            this.listenTo(model.get('environment'), 'change', this.weatheringTrigger);
            this.listenTo(model.get('movers'), 'change', this.weatheringTrigger);
            this.listenTo(model.get('spills'), 'change', this.checkSubstance);
            this.listenTo(model.get('spills'), 'add remove change', this.checkSubstance);
            this.listenTo(model.get('weatherers'), 'add', this.attachNewWeatherer);
            this.listenTo(this, 'new_wind new_water', this.manageWaves);
            this.listenTo(this, 'change', this.weatheringTrigger);
        },

        fetchHandler: function(model) {
            var env_objs = model.get('environment');
            var waves = env_objs.findWhere({'obj_type': 'gnome.environment.waves.Waves'});
            if (waves) {
                this.manageWaves(waves);
            } else {
                env_objs.map(_.bind(this.addObj,this));
            }
        },

        addObj: function(mod) {
            if (mod.get('obj_type').toLowerCase().includes('wind') &&
               this.get('wind') === null &&
               !this.get('windSpecified')) {
                this.set('wind', mod);
                this.listenTo(mod, 'change', this.weatheringTrigger);
                this.trigger('new_wind', mod);
            }
            if (mod.get('obj_type').toLowerCase().includes('water') &&
               this.get('water') === null &&
               !this.get('waterSpecified')) {
                this.set('water', mod);
                this.listenTo(mod, 'change', this.weatheringTrigger);
                this.trigger('new_water', mod);
            }
        },

        removeObj: function(mod) {
            if (mod === this.get('wind')){
                this.set('wind', null);
                this.set('windSpecified', false);
                this.stopListening(mod, 'change');
                this.trigger('new_wind', null);
            }
            if (mod === this.get('water')){
                this.set('water', null);
                this.set('waterSpecified', false);
                this.stopListening(mod, 'change');
                this.trigger('new_water', null);
            }
        },

        manageWaves: function(mod) {
            if (mod === null && this.get('waves') !== null) {
                webgnome.model.get('environment').remove(this.get('waves'));
                this.set('waves', null);
                this.trigger('new_waves', null);
            } else if (this.get('wind') && this.get('water') && this.get('waves') === null) {
                var waves = new WavesModel();
                waves.set('wind', this.get('wind'));
                waves.set('water', this.get('water'));
                waves.save(null, {
                    success: _.bind(function(mod){
                        webgnome.model.get('environment').add(mod);
                        webgnome.model.save();
                        this.set('waves', mod);
                    }, this)
                });
            } else if (mod !== null && mod.get('obj_type').toLowerCase().includes('waves')) {
                //pass waves object directly
                this.set('waves', mod);
                if(!this.get('wind')) {
                    this.set('wind', mod.get('wind'));
                }
                if(!this.get('water')) {
                    this.set('water', mod.get('water'));
                }
                if (!webgnome.model.get('environment').contains(mod)) {
                    webgnome.model.get('environment').add(mod);
                }
            }
        },

        checkSubstance: function() {
            var hasSubstance = false;
            var spills = webgnome.model.get('spills');
            if (spills.length > 0) {
                var substance = spills.at(0).get('substance');
                if (substance && substance.get('is_weatherable')) {
                    hasSubstance = true;
                }
            }
            this.set('hasSubstance', hasSubstance);
        },

        attachNewWeatherer: function(weatherer) {
            if (this.get('waves') != null && _.isNull(weatherer.get('waves'))) {
                weatherer.set('waves', this.get('waves'));
            }
            if (this.get('water') != null && _.isNull(weatherer.get('water'))) {
                weatherer.set('water', this.get('water'));
            }
            if (this.get('wind') != null && _.isNull(weatherer.get('wind'))) {
                weatherer.set('wind', this.get('wind'));
            }
            weatherer.save();
        },

        weatheringValid: function() {
            return (this.get('hasSubstance') &&
            !_.isUndefined(this.get('waves')) &&
            !_.isNull(this.get('waves')) &&
            !_.isUndefined(this.get('water')) &&
            !_.isNull(this.get('water')) &&
            !_.isUndefined(this.get('wind')) &&
            !_.isNull(this.get('wind')) &&
            this.windMoverTimeCompliance());
        },

        windMoverTimeCompliance: function() {
            //If the windmover does not succeed at time compliance for some reason,
            //the wind shouldn't be used in weathering
            if (_.isUndefined(this.get('wind')) || _.isNull(this.get('wind'))) {
                return false;
            }
            var wind = this.get('wind');
            var movers = webgnome.model.get('movers');
            var wm = movers.findWhere({'wind': wind});
            if (wm) {
                var valid = wm.get('time_compliance');
                return valid === 'valid';
            }
        },

        weatheringTrigger: _.debounce(function() {
            if (this.weatheringValid()){
                this.trigger('weatheringOn');
            } else {
                this.trigger('weatheringOff');
            }
        }, 250, false)
    });
    return defaultObjs;
});