define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var baseModel = Backbone.Model.extend({
        initialize: function(options){
            Backbone.Model.prototype.initialize.call(this, options);

            for(var key in this.model){
                // general object hydration 
                // loads the objects described in the defaults and model spec
                var embeddedClass = this.model[key];

                if(_.isNull(this.get(key))){
                    this.set(key, this.setChild(embeddedClass));
                } else if(_.isArray(this.get(key)) && _.isEmpty(this.get(key))){
                    var collection = new Backbone.Collection();
                    if(!_.isNull(embeddedClass)){
                        collection.add(this.setChild(embeddedClass));
                    }
                    
                    this.set(key, collection);
                }
            }
        },

        parse: function(response){
            // model needs a special parse function to turn child objects into their appropriate models
            for(var key in this.model){
                if(response[key]){
                    var embeddedClass = this.model[key];
                    var embeddedData = response[key];

                    if(_.isArray(embeddedData)){
                        response[key] = new Backbone.Collection();

                        if(!_.isObject(embeddedClass)){
                            // if the embedded class isn't an object it can only have one type of object in
                            // the given collection, so set it.
                            for(var obj in embeddedData){
                                response[key].add(this.setChild(embeddedClass, embeddedData[obj]));
                            }
                        } else {
                            // the embedded class is an object therefore we can assume
                            // that the collection can have several types of objects
                            // I.E. environment with wind and tide, figure out which one we have
                            // by looking at it's obj_type and cast it appropriatly.

                            for(var obj in embeddedData){
                                if(_.isFunction(embeddedClass[embeddedData[obj].obj_type])){
                                    response[key].add(this.setChild(embeddedClass[embeddedData[obj].obj_type], embeddedData[obj]));
                                } else {
                                    response[key].add(this.setChild(Backbone.Model, embeddedData[obj]));
                                }
                            }
                        }
                    } else {
                        response[key] = this.setChild(embeddedClass, embeddedData);
                    }
                }
            }
            return response;
        },

        setChild: function(cls, data){
            if(!_.isUndefined(data) && _.has(webgnome.obj_ref, data.id)){
                return webgnome.obj_ref[data.id];
            }
            if(_.isUndefined(data)){
                data = {};
            }
            var obj = new cls(data, {parse: true, silent: true});
            webgnome.obj_ref[data.id] = obj;
            return obj;
        },
    });

    return baseModel;
});