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
    'model/movers/wind'
], function(_, $, Backbone, moment,
    BaseModel, MapModel, SpillModel, TideModel, WindModel,
    WindMover){
    var gnomeModel = BaseModel.extend({
        url: '/model',
        ajax: [],
        model: {
            spills: SpillModel,
            map: MapModel,
            environment: {
                'gnome.environment.wind.Wind': WindModel,
                'gnome.environment.tide.Tide': TideModel
            },
            movers: {
                'gnome.movers.wind_movers.WindMover': WindMover
            },
            outputters: Backbone.Collection,
            weatherers: Backbone.Collection
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
                            model.set(key, []);
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
                            model.set(key, {id: model.get(key).get('id'), obj_type: model.get(key).get('obj_type')});
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
                        if(!_.isObject(embeddedClass)){
                            for(var id in embeddedData){
                                var obj = new embeddedClass({id: id}, {parse: true, key: key});
                                this.ajax.push(obj.fetch());
                            }
                        } else {
                            for(var id in embeddedData){
                                var obj = new Backbone.Model({id: id, urlRoot: '/' + key + '/'}, {parse: true});
                                this.ajax.push(obj.fetch({success: _.bind(function(model, response, options){
                                    this.key.add(new this.model[key][response.get('obj_type')](response), {parse: true});
                                }, this)}));
                                
                            }
                        }
                    } else if(embeddedData.obj_type.match('gnome.map') != -1){
                        // special case for map object as it is the only fully composed child of a model.
                        response[key] = new embeddedClass(embeddedData, {parse: true});
                    } else {
                        response[key] = new embeddedClass({id: embeddedData}, {parse: true});
                        this.ajax.push(response[key].fetch());
                    }
                }
            }
            $.when.apply($, this.ajax).done(_.bind(function(){
                this.set(response);
                this.trigger('ready');
            }, this));
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

        // toTree: function(){
            
        // }
        
    });

    return gnomeModel;
});