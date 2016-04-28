define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'ol'
], function(_, $, Backbone, BaseModel, ol){
    'use strict';
    var baseMover = BaseModel.extend({
        urlRoot: '/mover/',
        requesting: false,
        requested: false,

        initialize: function(options){
            BaseModel.prototype.initialize.call(this, options);
            this.on('change', this.resetRequest, this);
        },

        resetRequest: function(){
            this.requested = false;
        },

        getGrid: function(callback){
            var url = this.urlRoot + this.id + '/grid';
            if(!this.requesting && !this.requested){
                this.requesting = true;
                $.get(url, null, _.bind(function(grid){
                    this.requesting = false;
                    this.requested = true;
                    this.grid = grid;
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
        }
    });

    return baseMover;
});