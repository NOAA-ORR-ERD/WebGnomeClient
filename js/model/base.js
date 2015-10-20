define([
    'underscore',
    'backbone'
], function(_, Backbone){
    'use strict';
    var baseModel = Backbone.Model.extend({
        initialize: function(options){
            Backbone.Model.prototype.initialize.call(this, options);
            // for(var key in this.model){
            //     // general object hydration 
            //     // loads the objects described in the defaults and model spec
            //     var embeddedClass = this.model[key];

            //     if(_.isNull(this.get(key))){
            //         this.set(key, this.setChild(embeddedClass));
            //     } else if(_.isArray(this.get(key)) && _.isEmpty(this.get(key))){
            //         // get the collection from webgnome's default creation
            //         var collection = this.get(key);
            //         if(!_.isNull(embeddedClass)){
            //             collection.add(this.setChild(embeddedClass));
            //         }
                    
            //         this.set(key, collection, {silent: true});
            //     }
            // }

            this.on('sync', this.rewindModel, this);
        },

        rewindModel: function(){
            if(!_.isUndefined(webgnome) && _.has(webgnome, 'cache')){
                webgnome.cache.rewind();
            }
        },

        parse: function(response){
            // model needs a special parse function to turn child objects into their appropriate models
            for(var key in this.model){
                if(response[key]){
                    var embeddedClass = this.model[key];
                    var embeddedData = response[key];

                    if(_.isArray(embeddedData)){
                        // maintain the existing collection but reset it so it doesn't
                        // keep objects from the default notation on the model
                        response[key] = this.get(key);
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
                    } else {
                        // this is where the majority of all children are defined ex. spill's releaes and element_type object
                        response[key] = this.setChild(embeddedClass, embeddedData);
                    }
                }
            }
            return response;
        },

        setChild: function(Cls, data){
            if(!_.isUndefined(data) && _.has(webgnome.obj_ref, data.id)){
                return webgnome.obj_ref[data.id];
            }
            if(_.isUndefined(data)){
                data = {};
            }
            var obj = new Cls();
            obj.set(obj.parse(data));
            webgnome.obj_ref[data.id] = obj;
            return obj;
        },

        // child change shouldn't be mapped directly to an event
        // rather it should be manually envoked through a maped event
        // see gnome model for example.
        childChange: function(attr, child){
            if(!_.isObject(this.changed[attr])){
                this.changed[attr] = {};
            }
            this.changed[attr][child.get('id')] = child.changed;
            this.trigger('change', this);
        }
    });

    return baseModel;
});