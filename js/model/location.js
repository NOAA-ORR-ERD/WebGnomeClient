define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var gnomeLocation = BaseModel.extend({
        urlRoot: '/location/',

        parse: function(response, options){
            //response = webgnome.parseSanitize(response);
            if (this === webgnome.model){
                //Special case stuff for the main model, specifically start time and duration
                //Hate making the exception here but it's used in so many other object inits
                //and time interval checking code.
                if (response.start_time){
                    this.set('start_time', response.start_time);
                }
                if (response.duration){
                    this.set('duration', response.duration);
                }
                if (response.time_step){
                    this.set('time_step', response.time_step);
                }
            }
            // model needs a special parse function to turn child objects into their appropriate models
            for(var key in this.model){
                if(response[key]){
                    var embeddedClass = this.model[key];
                    var embeddedData = response[key];

                    if(_.isArray(embeddedData)){
                        // maintain the existing collection but reset it so it doesn't
                        // keep objects from the default notation on the model
                        if(this.get(key)){
                            response[key] = this.get(key);
                        } else {
                            response[key] = new Backbone.Collection();
                        }
                        response[key].reset([], {silent: true});

                        if(!_.isObject(embeddedClass)){
                            // if the embedded class isn't an object it can only have one type of object in
                            // the given collection, so set it.
                            for(var obj in embeddedData){
                                response[key].add(this.setChild(embeddedClass, embeddedData[obj]), {merge: true});
                            }
                        } else {
                            // the embedded class is an object therefore we can assume
                            // that the collection can have several types of objects
                            // I.E. environment with wind and tide, figure out which one we have
                            // by looking at it's obj_type and cast it appropriatly.

                            for(var obj2 in embeddedData){
                                if(_.isFunction(embeddedClass[embeddedData[obj2].obj_type])){
                                    response[key].add(this.setChild(embeddedClass[embeddedData[obj2].obj_type], embeddedData[obj2]), {merge: true});
                                } else {
                                    response[key].add(this.setChild(Backbone.Model, embeddedData[obj2]), {merge: true});
                                }
                            }
                        }
                    } else if (_.isObject(embeddedClass) && !_.isFunction(embeddedClass)) {
                        response[key] = this.setChild(embeddedClass[embeddedData.obj_type], embeddedData);
                    } else {
                        // this is where the majority of all children are defined ex. spill's releaes and element_type object
                        response[key] = this.setChild(embeddedClass, embeddedData);
                    }
                }
            }
            this.trigger('fetched', this);
            return response;
        },

    });

    return gnomeLocation;
});