define([
    'underscore',
    'backbone',
    'model/base',
    'model/environment/tide'
], function(_, Backbone, BaseModel, GnomeTide){
    var currentMover = BaseModel.extend({
        urlRoot: '/mover/',
        requesting: false,

        getGrid: function(callback){
            var url = webgnome.config.api + this.urlRoot + 'current/grid';
            if(!this.requesting){
                this.requesting = true;
                $.get(url, null, callback).always(_.bind(function(){
                    this.requesting = false;
                }, this));
            }
        }
    });

    return currentMover;
});