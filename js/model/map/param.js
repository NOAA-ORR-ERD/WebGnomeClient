define([
    'model/map/base',
    'model/visualization/map_appearance'
], function(BaseMap, MapAppearance){
    var paramMapModel = BaseMap.extend({
        defaults: {
            obj_type: 'gnome.maps.map.ParamMap',
            distance: '2',
            units: 'nm',
            bearing: '0',
            center: [0, 0, 0],
            _appearance: new MapAppearance()
        },


        initialize: function(options){
            BaseMap.prototype.initialize.call(this, options);
            this.on('change', this.resetRequest);
        },

        validate: function(attributes){
            if(attributes.center.length !== 3){
                return 'Invalid center coordinate, pattern must be "x,y".';
            }

            if(attributes.bearing > 360 || attributes.bearing < 0){
                return 'Bearing must be in degrees between 0 and 360';
            }

            if(attributes.distance < 0){
                return 'Distance can not be negative number';
            }
        }
    });

    return paramMapModel;
});