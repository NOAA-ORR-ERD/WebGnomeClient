define([
    'underscore',
    'backbone',
    'moment',
    'model/base',
], function(_, Backbone, moment, BaseModel){
    var risk = BaseModel.extend({
        urlRoot: '/environment/',

        defaults: {
            'obj_type': 'gnome.environment.resources.Risk',
            'area': 0,
            'diameter': 0,
            'distance': 0,
            'depth': 0,
            'assessment_time': 0,

            efficiency: {
                'skimming': 100,
                'dispersant': 100,
                'insitu_burn': 100
            },

            'surface': 1/3,
            'column': 1/3,
            'shoreline': 1/3,

            units: {
                'area': 'sq. km',
                'diameter': 'km',
                'distance': 'km',
                'depth': 'm'
            }
        },

        initialize: function(options){
            if (!_.isUndefined(webgnome.model)){
                this.attributes.assessment_time = webgnome.model.get('start_time');
            } else {
                this.attributes.assessment_time = moment().format('YYYY-MM-DDTHH:mm:ss');
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
            var st = moment(webgnome.model.get('start_time'));
            var et = moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's');
            var at = moment(attrs.assessment_time);
            if (at < st || at > et) {
                return 'Assessment time must be occur during the model time range!';
            }
        }

    });

    return risk;
    
});
