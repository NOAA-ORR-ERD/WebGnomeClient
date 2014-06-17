define([
    'underscore',
    'backbone',
    'moment',
    'model/base',
    'model/map',
    'model/spill',
    'model/environment'
], function(_, Backbone, moment, BaseModel, MapModel, SpillModel, EnvironmentModel){
    var gnomeModel = BaseModel.extend({
        url: '/model',

        model: {
            spills: SpillModel,
            environment: EnvironmentModel,
            map_id: MapModel
        },

        sync: function(method, model, options){
            // because of the unique structure of the gnome model, it's relation to other child object
            // via ids, we need to dehydrate any child objects into just an id before sending it to the
            // server.
            if(_.indexOf(['create', 'update'], method) != -1){
                for(var key in model.model){
                    if(model.get(key)){
                        if(model.get(key).models){
                            var array = model.get(key);
                            model.set(key, []);
                            _.forEach(array, function(element){
                                model.get(key).push(element.get('id'));
                            });
                        } else {
                            model.set(key, model.get(key).get('id'));
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
                        for(var id in embeddedData){
                            var obj = new embeddedClass({id: id}, {parse: true});
                            obj.fetch();
                            response[key].add(obj);
                        }
                    } else {
                        response[key] = new embeddedClass({id: embeddedData}, {parse: true});
                        response[key].fetch();
                    }
                }
            }

            return response;
        },

        validate: function(attrs, options) {
            if(attrs.duration <= 0 || isNaN(attrs.duration)){
                return 'Duration values should be numbers only and greater than 0.';
            }

            if(parseInt(attrs.days, 10) === 0 && parseInt(attrs.hours, 10) === 0){
                return 'Duration length should be greater than zero.';
            }

            if(parseInt(attrs.time_step, 10) != attrs.time_step){
                return 'Time steps must be a whole number.';
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
        
    });

    return gnomeModel;
});