//A model that stores appearance settings for various objects.

define([
        'underscore',
        'model/visualization/appearance',
        'model/visualization/colormap'
], function(_, BaseAppearance, ColorMap){
    'use strict';
    var SpillAppearanceModel = BaseAppearance.extend({
        defaults: function() { return {
            pin_on: true,
            les_on: true,
            scale: 1,
            data: 'Mass',
            colormap: new ColorMap(),
            ctrl_names: {title:'Spill Appearance',
                         pin_on: 'Show Pin',
                         les_on: 'Show Oil',
                         scale: 'Scale',
                        },
            _available_data: ['Mass','Age','Viscosity','Depth']
            };
        },

        initialize: function(model) {
            BaseAppearance.prototype.initialize.call(this, model);
            this.listenTo(this.get('colormap'), 'change', this.save);
            this.listenTo(this, 'change:data', this.updateSpillJsonOutputter);
        },

        updateSpillJsonOutputter: function(dtype) {
            var output = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.SpillJsonOutput'});
            if(dtype !== 'Viscosity') {
                this.get('colormap').set('numberScaleType', 'linear');
            }
            output._updateRequestedDataTypes(dtype);
        },

        save: function(attrs, options) {
            if(this.get('id')) {
                var json = this.toJSON();
                json.colormap = this.get('colormap').toJSON();
                this.appearance_cache.setItem(this.get('id') + '_appearance', json);
            }
        },

        fetch: function(options) {
            return new Promise(_.bind(function(resolve, reject) {
                this.appearance_cache.getItem(this.get('id') + '_appearance').then(
                    _.bind(function(attrs) {
                        if (attrs) {
                            attrs.colormap = new ColorMap(attrs.colormap);
                            this.set(attrs, {silent:true});
                            resolve(attrs);
                        } else {
                            resolve(attrs);
                        }
                    }, this)
                );
            }, this));
        }

    });
    return SpillAppearanceModel;
});
