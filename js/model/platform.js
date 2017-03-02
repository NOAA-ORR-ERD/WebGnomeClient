define([
    'underscore',
    'backbone',
    'model/base',
    'json!model/platforms.json'
], function(_, Backbone, BaseModel, platforms){
    var Platform = BaseModel.extend({
        defaults: function(){
            return {
                type: '',
                json_: 'webapi'
            };
        },

        models: {
            units: Backbone.Model
        },

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
        },

        getPlatformByName: function(){
            var name = this.get('name');
            if(!name){ return false; }

            var keys = _.keys(platforms);
            for(var g = 0; g < keys.length; g++){
                for(var p = 0; p < platforms[keys[g]].length; p++){
                    if (name === platforms[keys[g]][p].name) {
                        this.set('type', keys[g], {silent: true});
                        this.set(platforms[keys[g]][p]);
                    }
                }
            }
        },

        configureType: function(){
            if(this.get('type') === 'aircraft'){
                // set up aircraft defaults
                this._default_aircraft();
            } else {
                // set up vessel defaults
                this._default_vessel();
            }
        },

        _default_aircraft: function(){
            this.set({
                name: 'Custom Aircraft',
                swath_width: 75,
                swath_width_max: 200,
                swath_width_min: 30,
                application_speed: 100,
                application_speed_max: 200,
                application_speed_min: 30,
                pump_rate_min:10, 
                pump_rate_max: 800,
                payload: 500,
                max_op_time: 1,
                transit_speed: 100,
                approach: 0.5,
                departure: 0.5,
                reposition_speed: 100,
                u_turn_time: 5,
                taxi_land_depart: 25,
                fuel_load: 20,
                dispersant_load: 20,
                units: new Backbone.Model({
                    swath_width: 'ft',
                    application_speed: 'kt',
                    pump_rate: 'gpm',
                    payload: 'gal',
                    transit_speed: 'kt',
                    approach: 'nm',
                    departure: 'nm',
                    reposition_speed: 'kt',
                })
            });
        },

        _default_vessel: function(){
            this.set({
                name: 'Custom Vessel',
                swath_width: 75,
                swath_width_max: 200,
                swath_width_min: 30,
                application_speed: 100,
                application_speed_max: 200,
                application_speed_min: 30,
                pump_rate_min:10, 
                pump_rate_max: 800,
                payload: 500,
                max_op_time: 1,
                transit_speed: 100,
                fuel_load: 20,
                dispersant_load: 20,
                units: new Backbone.Model({
                    swath_width: 'ft',
                    application_speed: 'kt',
                    pump_rate: 'gpm',
                    payload: 'gal',
                    transit_speed: 'kt',
                })
            });
        }

    });

    return Platform;
});
