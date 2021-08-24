define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'cytoscape',
    'cosebilkent',
    'cytoscapeklay',
    'klayjs',
    'model/base',
    'views/base',
    'text!templates/model/graphview.html'
], function($, _, Backbone, module, cytoscape, cosebilkent, cytoscapeklay, klay,
            BaseModel, BaseView, GraphViewTemplate) {
    'use strict';
    cosebilkent(cytoscape);
    cytoscapeklay(cytoscape);
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
            var compiled = _.template(GraphViewTemplate)()
            this.$el.append(compiled)
            $('body').append(this.$el);
            this.cy = cytoscape({
              container: $('#model'), // container to render in

              elements: this.getElementList(),

              style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'label': 'data(name)'
                    }
                    
                },
                {
                    selector: '.off',
                    style: {
                        'border-width': '2px',
                        'border-style': 'solid',
                        'border-color': 'red'
                    }
                },
                {
                    selector: '.on',
                    style: {
                        'border-width': '2px',
                        'border-style': 'solid',
                        'border-color': 'green'
                    }
                },
                {
                  selector: 'edge',
                  style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'curve-style': 'bezier',
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
            window._cy = this.cy;
            this.applyLayout('klay');
        },

        applyLayout: function(name) {
            var cbo = {
                name: 'cose-bilkent',
                ready: function(){}, // Called on `layoutready`
                stop: function(){}, // Called on `layoutstop`
                nodeDimensionsIncludeLabels: true, // Whether to include labels in node dimensions. Useful for avoiding label overlap
                // number of ticks per frame; higher is faster but more jerky
                refresh: 30,
                // Whether to fit the network view after when done
                fit: true,
                // Padding on fit
                padding: 10,
                // Whether to enable incremental mode
                randomize: true,
                // Node repulsion (non overlapping) multiplier
                nodeRepulsion: 4500,
                // Ideal (intra-graph) edge length
                idealEdgeLength: 50,
                // Divisor to compute edge forces
                edgeElasticity: 0.45,
                // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
                nestingFactor: 0.1,
                // Gravity force (constant)
                gravity: 0.25,
                // Maximum number of iterations to perform
                numIter: 2500,
                // Whether to tile disconnected nodes
                tile: true,
                // Type of layout animation. The option set is {'during', 'end', false}
                animate: 'end',
                // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
                tilingPaddingVertical: 10,
                // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
                tilingPaddingHorizontal: 10,
                // Gravity range (constant) for compounds
                gravityRangeCompound: 0.75,
                // Gravity force (constant) for compounds
                gravityCompound: 0.15,
                // Gravity range (constant)
                gravityRange: 3.8,
                // Initial cooling factor for incremental layout
                initialEnergyOnIncremental: 0.5
            };
            var breadthfirst =  {
                name: 'breadthfirst',
                fit: true, // whether to fit the viewport to the graph
                directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
                padding: 30, // padding on fit
                circle: false, // put depths in concentric circles if true, put depths top down if false
                spacingFactor: 0.5, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
                boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
                nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
                roots: [webgnome.model.get('id')], // the roots of the trees
                maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
                animate: false, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled,
                animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
                ready: undefined, // callback on layoutready
                stop: undefined, // callback on layoutstop
                transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
            };

            var klay = {
                name: 'klay',
                nodeDimensionsIncludeLabels: true, // Boolean which changes whether label dimensions are included when calculating node dimensions
                fit: true, // Whether to fit
                padding: 20, // Padding on fit
                animate: false, // Whether to transition the node positions
                animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
                animationDuration: 500, // Duration of animation in ms if enabled
                animationEasing: undefined, // Easing of animation if enabled
                transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
                ready: undefined, // Callback on layoutready
                stop: undefined, // Callback on layoutstop
                klay: {
                // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
                addUnnecessaryBendpoints: true, // Adds bend points even if an edge does not change direction.
                aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
                borderSpacing: 20, // Minimal amount of space to be left to the border
                compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
                crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
                /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
                INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
                cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
                /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
                INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
                direction: 'RIGHT', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
                /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
                edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
                edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
                feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
                fixedAlignment: 'BALANCED', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
                /* NONE Chooses the smallest layout from the four possible candidates.
                LEFTUP Chooses the left-up candidate from the four possible candidates.
                RIGHTUP Chooses the right-up candidate from the four possible candidates.
                LEFTDOWN Chooses the left-down candidate from the four possible candidates.
                RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
                BALANCED Creates a balanced layout from the four possible candidates. */
                inLayerSpacingFactor: 0.75, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
                layoutHierarchy: true, // Whether the selected layouter should consider the full hierarchy
                linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
                mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
                mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
                nodeLayering:'INTERACTIVE', // Strategy for node layering.
                /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
                LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
                INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
                nodePlacement:'BRANDES_KOEPF', // Strategy for Node Placement
                /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
                LINEAR_SEGMENTS Computes a balanced placement.
                INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
                SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
                randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
                routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
                separateConnectedComponents: false, // Whether each connected component should be processed separately
                spacing: 15, // Overall setting for the minimal amount of space to be left between objects
                thoroughness: 7 // How much effort should be spent to produce a nice layout..
            },
  priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
            };

            var opts;
            if (name === 'cbo') {
                opts = cbo;
            } else if (name === 'breadthfirst'){
                opts = breadthfirst;
            } else if (name === 'klay') {
                opts = klay;
            }
            var layout = this.cy.layout(opts);
            layout.run();
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

        _getElementList: function(model, elemList, attrName, parentID, parentName) {
            //recursive function that traverses the model and generates the data objects used
            //to generate the graph. Does a depth first traversal of the model
            var edge, i;
            if(model instanceof BaseModel && model.get('obj_type', false)){
                //handles GNOME objects
                //start by checking to see if this object was already added
                for (var k = 0; k < elemList.length; k++) {
                    if (elemList[k].data.id === model.get('id')) {
                        //model was already added some other time, so only create a new edge
                        if (parentID.indexOf('.') !== -1) {
                            //if the gnome object is part of a list of some sort??
                            //not sure what this catches...
                            elemList[k].data.parent = parentID;
                            return elemList[k].data.id;
                        } else {
                            edge = {
                                data: {
                                    id: parentID + '>' + elemList[k].data.id,
                                    source: parentID,
                                    target: elemList[k].data.id
                                }
                            };
                            elemList.push(edge);
                            return elemList[k].data.id;
                        }
                    }
                }

                //extract the data from each model's Backbone attributes
                var keys = model.keys();
                var thisObj = {};
                elemList.push(thisObj);
                thisObj.model = model;
                thisObj.group = 'nodes';
                thisObj.data = {};
                thisObj.classes = [];

                for(i = 0; i < keys.length; i++) {
                    //skip underscored attributes
                    if(!keys[i].startsWith('_')) {
                        //recurse into the attribute
                        thisObj.data[keys[i]] = this._getElementList(model.get(keys[i]), elemList, keys[i], model.get('id'), model.get('name'));
                    }
                }
                
                if (model.get('on') === false){
                    thisObj.classes.push('off');
                }
                if (model.get('on') === true) {
                    thisObj.classes.push('on');
                }

                if (parentID) {
                    if (parentID.indexOf('.') !== -1) {
                        thisObj.data.parent = parentID;
                        /*edge = {
                            data: {
                                id: parentName + '>' + thisObj['data']['id'],
                                source: parentID,
                                target: thisObj['data']['id']
                            }
                        }
                        elemList.push(edge);*/
                    } else {
                        edge = {
                            
                            data: {
                                id: parentName + '>' + thisObj.data.id,
                                source: parentID,
                                target: thisObj.data.id
                            }
                        };
                        //add the edge that reaches this object to the list
                        elemList.push(edge);
                    }
                }
                //return this model's ID for use by the parent
                return model.get('id');
            } else if (model instanceof Backbone.Collection) {
                //handles collections such as model.environment
                var thisColl = {};
                elemList.push(thisColl);
                thisColl._model = model;
                thisColl.group = 'nodes';
                thisColl.data = {};
                thisColl.data.id = parentName + '.' + attrName;
                thisColl.data.name = thisColl.data.id;
                var elem_id, rv = [];
                for(i = 0; i < model.length; i++) {
                    elem_id = this._getElementList(model.models[i], elemList, i, thisColl.data.id, model.get('name'));
                    rv.push(elem_id);
                }
                edge = {
                    data: {
                        id: parentName + '>' + thisColl.data.id,
                        source: parentID,
                        target: thisColl.data.id
                    }
                };
                elemList.push(edge);
                return rv;
            } else {
                //handles all other data types, just returns them verbatim
                return model;
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