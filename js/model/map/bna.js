define([
    'underscore',
    'model/map/base'
], function(_, BaseMap){
    var mapBnaModel = BaseMap.extend({
        geographical: true,

        defaults: function() {
            var def = {
                obj_type: 'gnome.map.MapFromBNA'
            };
            _.defaults(def, BaseMap.prototype.defaults());
            return def;
        }
    });

    return mapBnaModel;
});