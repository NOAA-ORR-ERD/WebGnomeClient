define([
    'underscore',
    'backbone',
    'model/base',
], function(_, Backbone, BaseModel){
    var risk = BaseModel.extend({
        urlRoot: '/environment/',

        defaults: {
            'obj_type': 'gnome.environment.resources.Risk',
            'area': 0,
            'diameter': 0,
            'distance': 0,
            'depth': 0,
            duration: {
                'hours': 0,
                'days': 0
            },

            efficiency: {
                'skimming': 50,
                'dispersant': 50,
                'insitu_burn': 50
            },
            'surface': .33,
            'column': .33,
            'shoreline': .34,
            units: {
                'area': 'sq. km',
                'diameter': 'km',
                'distance': 'km',
                'depth': 'm'
            }
        },

        convertAreaToSquareMeters: function(){
            var a = this.get('area');
            var u = this.get('units').area;

            if (u === 'sq. km') {
                a = a * 1000 * 1000;
            } else if (u === 'sq. miles') {
                a = a * 2.59 * 1000 * 1000;
            } else if (u === 'hectares') {
                a = a * 10000;
            } else if (u === 'acres') {
                a = a * 4046.86;
            }
            return a;
        },

        convertDiameterToMeters: function(){
            var a = this.get('diameter');
            var u = this.get('units').diameter;

            if (u === 'km') {
                a = a * 1000;
            } else if (u === 'miles') {
                a = a * 2.59 * 1000;
            }
            return a;
        },

        convertDistanceToMeters: function(){
            var a = this.get('distance');
            var u = this.get('units').distance;

            if (u === 'km') {
                a = a * 1000;
            } else if (u === 'miles') {
                a = a * 2.59 * 1000;
            }
            return a;
        },

        convertDepthToMeters: function(){
            var a = this.get('depth');
            var u = this.get('units').depth;

            if (u === 'ft') {
                a = a * 0.3048;
            } else if (u === 'yards') {
                a = a * 0.9144;
            }
            return a;
        },

        convertDurationToSeconds: function(){
            var h = this.get('duration').hours;
            var d = this.get('duration').days;

            return (h * 3600) + (d * 3600 * 24);
        },

        validate: function(attrs, options){
            if (attrs.area < 1 || attrs.area === ''){
                return 'Water area must be greater than zero!';
            }
            if (attrs.diameter < 1 || attrs.diameter === ''){
                return 'Water diameter must be greater than zero!';
            }
            if (attrs.distance < 1 || attrs.distance === ''){
                return 'Distance from shore must be greater than zero!';
            }
            if (attrs.depth < 1 || attrs.depth === ''){
                return 'Average water depth must be greater than zero!';
            }
            if ((attrs.duration.days*24 + attrs.duration.hours) <= 0){
                return 'Duration time must be greater than zero!';
            }
        }

    });

    return risk;
    
});
