define([
    'model/movers/base',
    'model/environment/gridwind',
    'model/environment/wind',
    'model/visualization/mover_appearance'
], function(BaseMover, GridWind, Wind, MoverAppearance) {
    var componentMover = BaseMover.extend({
        urlRoot: '/mover/',
        defaults: function() { 
            return {
                '_appearance': new MoverAppearance(),
                'obj_type': 'gnome.movers.current_movers.ComponentMover',
                'wind': null,
            };
        },

        model: {
            wind: {
                'gnome.environment.wind.Wind': Wind,
                'gnome.environment.environment_objects.GridWind': GridWind
            }
        },
        
        initialize: function(options) {
            BaseMover.prototype.initialize.call(this, options);
            if (!_.isUndefined(webgnome.model)) {
                this.addListeners(webgnome.model);
            }
        },

        addListeners: function(model) {
            if (this.get('id')) {
                this.listenTo(
                    // model should be the webgnome.model
                    model.default_env_refs, 'change',
                    _.bind(function(w) {
                        var keys = _.keys(w.changed);
                        for (var i = 0; i < keys.length; i++) {
                            if (!_.isUndefined(this.get(keys[i]))) {
                                // If this object has a 'wind' and the passed model w is a 'wind', then set it
                                // Do not set it if this weatherer does not have the attribute
                                var attrs = {};
                                attrs[keys[i]] = w.changed[keys[i]];
                                this.save(attrs);
                            }
                        }
                    }, this)
                );
            }
        },
    });

    return componentMover;
});
