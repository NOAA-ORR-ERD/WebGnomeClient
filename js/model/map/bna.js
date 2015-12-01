define([
    'model/map/base'
], function(BaseMap){
    var mapBnaModel = BaseMap.extend({
        geographical: true
    });

    return mapBnaModel;
});