define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'ol',
    'moment'
], function(_, $, Backbone, BaseModel, ol, moment){
    'use strict';
    var baseMover = BaseModel.extend({
        urlRoot: '/mover/',
        requesting: false,
        requested_grid: false,
        requested_centers: false,

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
            this.on('change', this.resetRequest, this);
        },

        resetRequest: function(){
            this.requested = false;
        },

        getGrid: function(callback){
            var url = this.urlRoot + this.id + '/grid';
            if(!this.requesting && !this.requested_grid){
                this.requesting = true;
                $.get(url, null, _.bind(function(grid){
                    this.requesting = false;
                    this.requested_grid = true;
                    this.grid = grid;

                    // make it a closed shape if it isn't.
                    for(var cell = 0; cell < this.grid.length; cell++){
                        if(this.grid[cell][0] !== this.grid[cell][this.grid[cell].length - 2] ||
                            this.grid[cell][1] !== this.grid[cell][this.grid[cell].length - 1]){
                            // if the last set of coords are not the same as the first set
                            // copy the first set to the end of the array.
                            this.grid[cell].push(this.grid[cell][0]);
                            this.grid[cell].push(this.grid[cell][1]);
                        }
                    }
                    if(callback){
                        callback(this.grid);
                    }
                    return this.grid;
                }, this));
            } else if(callback) {
                callback(this.grid);
                return this.grid;
            }
        },

        getCenters: function(callback){
            var url = this.urlRoot + this.id + '/centers';
            if(!this.requesting && !this.requested_centers){
                this.requesting = true;
                $.get(url, null, _.bind(function(centers){
                    this.requesting = false;
                    this.requested_centers = true;
                    this.centers = centers;

                    if(callback){
                        callback(this.centers);
                        return this.centers;
                    }
                }, this));
            } else{
                callback(this.centers);
                return this.centers;
            }
        },

        processGrid: function(grid){
            var features = [];
            for(var ar = 0; ar < grid.length; ar++){
                var feature = new ol.Feature();
                var geom = new ol.geom.Polygon([grid[ar]], 'XY')
                    .transform('EPSG:4326', 'EPSG:3857');
                feature.set('geometry', geom, true);
                features.push(feature);
            }
            return features;
        },

        isTimeValid: function() {
            var model_start = webgnome.model.get('start_time');
            var model_stop = webgnome.model.getEndTime();
            var active_start = this.get('active_start');
            var active_stop = this.get('active_stop');
            var real_data_start = this.get('real_data_start');
            var real_data_stop = this.get('real_data_stop');
            var extrapolate = this.get('extrapolate');
            var on = this.get('on');

            if ((!extrapolate && on) && (active_start === '-inf' || active_start > model_start)) {
                if (real_data_start > model_start) {
                    return false;
                }

                if (active_stop === 'inf' || (real_data_stop < active_stop && real_data_stop !== real_data_start)) {
                    return false;
                }
            }

            return true;
        }
    });

    return baseMover;
});