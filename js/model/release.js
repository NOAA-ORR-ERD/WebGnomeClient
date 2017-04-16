define([
    'underscore',
    'backbone',
    'ol',
    'model/base',
    'moment'
], function(_, Backbone, ol, BaseModel, moment){
    'use strict';
    var gnomeRelease = BaseModel.extend({
        urlRoot: '/release/',

        defaults: {
            'json_': 'webapi',
            'obj_type': 'gnome.spill.release.PointLineRelease',
            'end_position': [0, 0, 0],
            'start_position': [0, 0, 0],
            'num_elements': 1000,
            'num_released': 0,
            'start_time_invalid': true
        },

        initialize: function(options){
            var start_time = '';
            if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)){
                start_time = moment(webgnome.model.get('start_time'));
            } else {
                start_time = moment();
            }

            if(_.isUndefined(this.get('release_time'))){
                this.set('release_time', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            }
            var end_time = '';
            if (_.has(window, 'webgnome') && _.has(webgnome, 'model') && !_.isNull(webgnome.model)){
                end_time = start_time.clone();
                end_time.add(webgnome.model.get('duration'), 's');
            } else {
                end_time = moment();
            }

            if(_.isUndefined(this.get('end_release_time'))){
                this.set('end_release_time', end_time.format('YYYY-MM-DDTHH:mm:ss'));
            }

            if(webgnome.hasModel()){
                if(webgnome.model.get('name') === 'ADIOS Model_'){
                    this.set('num_elements', 100);
                }
            }

            BaseModel.prototype.initialize.call(this, options);
        },

        getDuration: function(){
            var startInUnix = moment(this.get('release_time')).unix();
            var endInUnix = moment(this.get('end_release_time')).unix();

            return endInUnix - startInUnix;
        },

        durationShift: function(startTime) {
            var duration = this.getDuration();
            var startObj = moment(startTime);
            this.set('release_time', startTime);
            var endTime = startObj.add(duration, 's').format();
            this.set('end_release_time', endTime);
        },

        validate: function(attrs, options){
            if(this.validateAmount(attrs)){
                return this.validateAmount(attrs);
            }
            if(this.validateLocation(attrs)){
                return this.validateLocation(attrs);
            }
        },

        validateLocation: function(attrs){
            if (_.isUndefined(attrs)){
                attrs = this.attributes;
            }
            
            if(parseFloat(attrs.start_position[0]) !== attrs.start_position[0] || parseFloat(attrs.start_position[1]) !== attrs.start_position[1]){
                return 'Start position must be in decimal degrees.';
            }

            if(parseFloat(attrs.end_position[0]) !== attrs.end_position[0] || parseFloat(attrs.end_position[1]) !== attrs.end_position[1]){
                return 'End position must be in decimal degrees.';
            }

            if (!_.isUndefined(webgnome.model) && !_.isUndefined(webgnome.model.get('map'))){
                return this.isReleaseInGeom(webgnome.model.get('map').getSpillableArea());
            }
        },

        isReleaseInGeom: function(geom){
            if(!_.isArray(geom)){
                geom = [geom];
            }
            
            var start = [this.get('start_position')[0], this.get('start_position')[1]];
            var end = [this.get('end_position')[0], this.get('end_position')[1]];
            var error = 'Start or End position are outside of supported area';
            for(var p = 0; p < geom.length; p++){
                var source = new ol.source.Vector({
                    features: [new ol.Feature({
                        geometry: geom[p]
                    })]
                });
                if(source.getFeaturesAtCoordinate(start).length > 0){
                    error = false;
                }
                if(source.getFeaturesAtCoordinate(end).length > 0){
                    error = false;
                }
            }

            if(error){
                return error;
            }
        },

        isReleasePoint: function() {
            var start_point = this.get('start_position');
            var end_point = this.get('end_position');

            if (start_point[0] !== end_point[0] || start_point[1] !== end_point[1]) {
                return false;
            }

            return true;
        },

        validateAmount: function(attrs){
            if (moment(attrs.release_time).isAfter(attrs.end_release_time)){
                return 'Duration must be a positive value';
            }
        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var elementAmount = this.get('num_elements');
            var name = this.get('name');
            var releaseStart = moment(this.get('release_time')).format('lll');
            var releaseEnd = moment(this.get('end_release_time')).format('lll');
            var numberReleased = this.get('num_released');
            var invalidStart = this.get('start_time_invalid');

            attrs.push({title: 'Name: ' + name, key: 'Name',
                         obj_type: this.get('name'), action: 'edit', object: this});

            attrs.push({title: 'Time of Release: ' + releaseStart, key: 'Time of Release',
                         obj_type: this.get('release_time'), action: 'edit', object: this});

            attrs.push({title: 'End Time of Release: ' + releaseEnd, key: 'End Time of Release',
                         obj_type: this.get('end_release_time'), action: 'edit', object: this});

            attrs.push({title: 'Element Amount: ' + elementAmount, key: 'Element Amount',
                         obj_type: this.get('num_elements'), action: 'edit', object: this});

            attrs.push({title: 'Elements Released: ' + numberReleased, key: 'Elements Released',
                         obj_type: this.get('num_released'), action: 'edit', object: this});

            attrs.push({title: 'Start Time Invalid: ' + invalidStart, key: 'Start Time Invalid',
                         obj_type: this.get('start_time_invalid'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        }

    });

    return gnomeRelease;
    
});
