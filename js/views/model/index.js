define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'model/base',
    'module',
    'model/cache',
    'views/model/trajectory/index',
    'views/model/fate',
    'sweetalert',
    'cytoscape'
], function($, _, Backbone, BaseView, BaseModel, module, Cache, TrajectoryView, FateView, swal, cytoscape){
    'use strict';
    var modelView = BaseView.extend({
        className: 'model-view',
        switch: true,
        id:'model',
        contracted: false,

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            this.contextualize();
            this.render();
            $(window).on('resize', _.bind(function(){
                this.updateHeight();
            }, this));
        },

        events: {
        },

        contextualize: function(){
        },

        render: function(){
            // this.$el.append(IndexTemplate);
            $('body').append(this.$el);
            this.cy = cytoscape({
              container: $('#model'), // container to render in

              elements: this.getElementList(),

              style: [ // the stylesheet for the graph
                {
                  selector: 'node',
                  style: {
                    'background-color': '#666',
                    'label': 'data(name)'
                  }
                },

                {
                  selector: 'edge',
                  style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                  }
                }
              ],

              layout: {
                name: 'grid',
                rows: 1
              }
            });
        },

        getElementList: function() {
            if(_.isUndefined(webgnome.model)){
                console.error('no model');
                return;
            }
            var elems = [];
            this._getElementList(webgnome.model, elems);
            return elems;
        },

        _getElementList: function(model, elemList, attrName, parentID) {
            if(model instanceof BaseModel){
                for (var k = 0; k < elemList.length; k++) {
                    if (elemList[k].data.id === model.get('id')) {
                        //model was already added some other time, so only create a new edge
                        edge = {
                            data: {
                                id: parentID + '>' + elemList[k].data.id,
                                source: parentID,
                                target: elemList[k].data.id
                            }
                        }
                        elemList.push(edge);
                        return elemList[k].data.id;
                    }
                }
                var keys = model.keys();
                var thisObj = {}
                elemList.push(thisObj);
                thisObj['_model'] = model;
                thisObj['group'] = 'nodes';
                thisObj['data'] = {};

                var edge;
                for(var i = 0; i < keys.length; i++) {
                    if(!keys[i].startsWith('_')) {
                        thisObj['data'][keys[i]] = this._getElementList(model.get(keys[i]), elemList, keys[i], model.get('id'));
                    }
                }
                if (parentID) {
                    edge = {
                        data: {
                            id: parentID + '>' + thisObj['data']['id'],
                            source: parentID,
                            target: thisObj['data']['id']
                        }
                    }
                    elemList.push(edge);
                }
                return model.get('id');
            } else if (model instanceof Backbone.Collection) {
                var thisColl = {}
                elemList.push(thisColl);
                thisColl['_model'] = model;
                thisColl['group'] = 'nodes';
                thisColl['data'] = {};
                thisColl['data']['id'] = parentID + '.' + attrName;
                thisColl['data']['name'] = thisColl['data']['id'];
                var elem_id, edge, rv = [];
                for(var i = 0; i < model.length; i++) {
                    elem_id = this._getElementList(model.models[i], elemList, i, thisColl['data']['id']);
                    rv.push(elem_id);
                }
                edge = {
                    data: {
                        id: parentID + '>' + thisColl['data']['id'],
                        source: parentID,
                        target: thisColl['data']['id']
                    }
                }
                elemList.push(edge);
                return rv;
            } else {
                return model
            }
        },

        switchView: function(){
            var view = localStorage.getItem('view');
            if(view === 'fate') {
                this.$('.switch').removeClass('fate').addClass('trajectory');
                localStorage.setItem('view', 'trajectory');
                view = 'trajectory';
            } else {
                this.$('.switch').removeClass('trajectory').addClass('fate');
                localStorage.setItem('view', 'fate');
                view = 'fate';
            }

            this.reset();

            if(view === 'fate'){
                this.renderFate();
                this.$el.css('height', 'auto');
            } else {
                this.renderTrajectory();
                this.updateHeight();
            }
        },

        reset: function(){
            // if(this.TreeView){
            //     this.TreeView.close();
            // }
            if(this.TrajectoryView){
                this.TrajectoryView.close();
            }
            if(this.FateView){
                this.FateView.close();
            }
        },

        updateHeight: function(){
            var view = localStorage.getItem('view');
            if(view === 'trajectory'){
                var win = $(window).height();
                var height = win - 94 - 52;
                this.$el.css('height', height + 'px');
            }
        },

        close: function(){
            if(this.TreeView){
                this.TreeView.close();
            }

            if(this.TrajectoryView){
                this.TrajectoryView.close();
            }
            
            if(this.FateView){
                this.FateView.close();
            }

            $(window).off('resize', _.bind(function(){
                this.updateHeight();
            }, this));

            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();

            this.remove();
            if (this.onClose){
                this.onClose();
            }
        }
    });

    return modelView;
});