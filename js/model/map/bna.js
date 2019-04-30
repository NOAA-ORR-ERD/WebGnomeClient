define([
    'model/map/base'
], function(BaseMap){
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