define([
    'underscore',
    'backbone',
    'moment',
    'model/weatherers/base',
    'model/environment/waves'
], function(_, Backbone, moment, BaseModel, WavesModel) {
    'use strict';
    var dispersionWeatherer = BaseModel.extend({
        defaults: {
            'obj_type': 'gnome.weatherers.cleanup.ChemicalDispersion',
            'name': 'Dispersion',
            'active_range': ['-inf', 'inf'],
            'efficiency': 0.20,
            'waves': null,
        },

        model: {
            waves: Backbone.Model,
        },

        validate: function(attrs, options) {
            if (attrs.active_range[0] === attrs.active_range[1]) {
                return "Duration must be input!";
            }

            if (isNaN(attrs.fraction_sprayed) || attrs.fraction_sprayed <= 0) {
                return 'Percent of oil sprayed must be greater than zero!';
            }           
        },

        resetEndTime: function() {
            var timeStepLength;

            if (_.has(window, 'webgnome') &&
                    _.has(webgnome, 'model') &&
                    !_.isNull(webgnome.model)) {
                timeStepLength = parseFloat(webgnome.model.get('time_step'));
            }
            else {
                timeStepLength = 900;
            }

            var startTime = moment(this.get('active_range')[0]).unix();
            var newEndTime = moment((startTime + timeStepLength) * 1000);

            this.set('active_range', [startTime, newEndTime.format()]);
        },

        toTree: function(){
            return '';
        }
    });

    return dispersionWeatherer;
});