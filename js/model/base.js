define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var baseModel = Backbone.Model.extend({
        initialize: function(options){
            Backbone.Model.prototype.initialize.call(options, this);

            for(var key in this.model){
                var embeddedClass = this.model[key];

                if(_.isNull(this.get(key))){
                    this.set(key, new embeddedClass());
                } else if(_.isArray(this.get(key)) && _.isEmpty(this.get(key))){
                    var collection = new Backbone.Collection();
                    if(!_.isNull(embeddedClass)){
                        collection.add(new embeddedClass());
                    }
                    
                    this.set(key, collection);
                }
            }
        }
    });

    return baseModel;
});