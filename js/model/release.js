define([
    'underscore',
    'backbone',
    'model/base',
    'moment'
], function(_, Backbone, BaseModel, moment){
    var gnomeRelease = BaseModel.extend({
        url: '/release',

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
            if (!_.isUndefined(webgnome.model)){
                start_time = moment(webgnome.model.get('start_time'));
            } else {
                start_time = moment();
            }

            if(_.isUndefined(this.get('release_time'))){
                this.set('release_time', start_time.format('YYYY-MM-DDTHH:mm:ss'));
            }
            var end_time = '';
            if (!_.isUndefined(webgnome.model)){
                end_time = start_time.add(webgnome.model.get('duration'), 's');
            } else {
                end_time = moment();
            }

            var prediction = localStorage.getItem('prediction');

            if (prediction == 'trajectory' || prediction == 'both'){
                this.set('num_per_timestep', null);
                this.set('num_elements', 1000);
            } else {
                this.set('num_per_timestep', 10);
                this.set('num_elements', null);
            }
            
            if(_.isUndefined(this.get('end_release_time'))){
                this.set('end_release_time', end_time.format('YYYY-MM-DDTHH:mm:ss'));
            }
            BaseModel.prototype.initialize.call(this, options);
        },

        validate: function(attrs, options){
            if(parseFloat(attrs.start_position[0]) != attrs.start_position[0] || parseFloat(attrs.start_position[1]) != attrs.start_position[1]){
                return 'Start position must be in decimal degrees.';
            }

            if(parseFloat(attrs.end_position[0]) != attrs.end_position[0] || parseFloat(attrs.end_position[1]) != attrs.end_position[1]){
                return 'Start position must be in decimal degrees.';
            }

            if(isNaN(attrs.num_elements)){
                return 'Release amount must be a number.';
            }
            
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