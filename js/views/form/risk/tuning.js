define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryui/core',
    'fabric',
    'gauge',
    'views/modal/form',
    'text!templates/risk/tuning.html',
], function($, _, Backbone, jqueryui, fabric, Gauge, FormModal, RiskTemplate) {
    var riskForm = FormModal.extend({
        className: 'modal fade form-modal risk-form',
        name: 'risk',
        title: 'Environmental Risk Assessment Input',
        benefitGauge: null,

        initialize: function(options, model) {
            FormModal.prototype.initialize.call(this, options);
            this.model = (model ? model : null);
        },

        render: function(options){
            this.body = _.template(RiskTemplate, {
                surface: this.model.get('surface').toFixed(3),
                column: this.model.get('column').toFixed(3),
                shoreline: this.model.get('shoreline').toFixed(3),
                surfaceRI: (this.model.get('relativeImportance').surface * 100).toFixed(3),
                columnRI: (this.model.get('relativeImportance').column * 100).toFixed(3),
                shorelineRI: (this.model.get('relativeImportance').shoreline * 100).toFixed(3),
            });

            FormModal.prototype.render.call(this, options);

            this.createBenefitGauge('benefit', 50);

            this.createSlider('.slider-skimming', this.model.get('efficiency').skimming);
            this.createSlider('.slider-dispersant', this.model.get('efficiency').dispersant);
            this.createSlider('.slider-in-situ-burn', this.model.get('efficiency').insitu_burn);

            this.createRelativeImportanceInput('importance', 1);

            this.updateBenefit();
        },

        createBenefitGauge: function(selector, value){
            var opts = {
                angle: 0, // The length of each line
                pointer: {
                    length: 0.5, // The radius of the inner circle
                    strokeWidth: 0.035, // The rotation offset
                    color: '#000000' // Fill color
                },
                limitMax: 'true',   // If true, the pointer will not go past the end of the gauge
                colorStart: '#ff0000',   // Colors
                colorStop: '#00ff00',    // just experiment with them
                strokeColor: '#E0E0E0',   // to see which ones work best for you
                generateGradient: true,
                gradientType: 1,
                maxValue: 100,
                animationSpeed: 20
            };
            var target = document.getElementById('benefit'); // your canvas element
            this.benefitGauge = new Gauge(target).setOptions(opts);
        },

        createRelativeImportanceInput: function(selector, value){
            var canvas = this.__canvas = new fabric.Canvas(selector, { selection: false });
            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

            function makeCircle(left, top, s, l1, l2, l3, l) {
                var radius = 1;
                if (l === null) radius = 5;
                var c = new fabric.Circle({
                              strokeWidth: 5,
                              radius: radius,
                              fill: '#fff',
                              stroke: '#666',
                              selectable: false
                });
                c.hasControls = c.hasBorders = false;

                var g = null;

                if (l !== null) {
                    var t = new fabric.Text(l, {
                                  fontSize: 14,
                                  evented: false
                    });
                    g = new fabric.Group([c,t], {
                              left: left,
                              top: top,
                              selectable: s
                    });
                } else {
                    g = new fabric.Group([c], {
                              left: left,
                              top: top,
                              selectable: s
                    });
                }

                g.hasControls = c.hasBorders = false;
                g.l1 = l1;
                g.l2 = l2;
                g.l3 = l3;

                return g;
            }

            function makeLine(coords, n) {
                var l = new fabric.Line(coords, {
                              fill: 'red',
                              stroke: 'red',
                              strokeWidth: 5,
                              selectable: false
                });
                l.linename = n;

               return l;
            }

            var centerx = 150,
                centery = 150,
                radius = 100;

            var pt1x = centerx + radius * Math.cos(0),
                pt1y = centery + radius * Math.sin(0);
            var pt2x = centerx + radius * Math.cos(4*Math.PI/3),
                pt2y = centery + radius * Math.sin(4*Math.PI/3);
            var pt3x = centerx + radius * Math.cos(-4*Math.PI/3),
                pt3y = centery + radius * Math.sin(-4*Math.PI/3);

            var line1 = makeLine([pt1x,  pt1y, centerx, centery], 'surface'),
                line2 = makeLine([centerx, centery, pt2x, pt2y], 'column'),
                line3 = makeLine([centerx, centery,  pt3x, pt3y], 'shoreline');

            canvas.add(line1, line2, line3);

            canvas.add(
                makeCircle(line1.get('x1'), line1.get('y1'), true, null,  line1, null, 'surface'),
                makeCircle(line1.get('x2'), line1.get('y2'), true, line1, line2, line3, null),
                makeCircle(line2.get('x2'), line2.get('y2'), true, line2, null,  null, 'column'),
                makeCircle(line3.get('x2'), line3.get('y2'), true, line3, null,  null, 'shoreline')
            );

            canvas.on('object:moving', _.bind(function(e) {
                var p = e.target;
                p.l1 && p.l1.set({ 'x2': p.left, 'y2': p.top });
                p.l2 && p.l2.set({ 'x1': p.left, 'y1': p.top });
                p.l3 && p.l3.set({ 'x1': p.left, 'y1': p.top });
                canvas.renderAll();
                this.calculateRI();
            }, this));

            canvas.renderAll();
        },

        createSlider: function(selector, value){
            this.$(selector).slider({
                    max: 100,
                    min: 0,
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.reassessRisk();
                        }, this)
            });
        },

        reassessRisk: function(){
            var skimming = this.$('.slider-skimming').slider('value');
            var dispersant = this.$('.slider-dispersant').slider('value');
            var insitu_burn = this.$('.slider-in-situ-burn').slider('value');

            // set model
            var e = this.model.get('efficiency');
            e.skimming = skimming;
            e.dispersant = dispersant;
            e.insitu_burn = insitu_burn;

            // assess model
            this.model.assessment();

            this.updateBenefit();
        },

        calculateRI: function(){
            var canvas = this.__canvas;
            var s = canvas._objects[0];
            var surfaceRI = Math.sqrt(((s.x1-s.x2)*(s.x1-s.x2)) + ((s.y1-s.y2)*(s.y1-s.y2)))
            var c = canvas._objects[1];
            var columnRI = Math.sqrt(((c.x1-c.x2)*(c.x1-c.x2)) + ((c.y1-c.y2)*(c.y1-c.y2)))
            var l = canvas._objects[2];
            var shorelineRI = Math.sqrt(((l.x1-l.x2)*(l.x1-l.x2)) + ((l.y1-l.y2)*(l.y1-l.y2)))
            var t = surfaceRI+columnRI+shorelineRI;

            // set model
            var ri = this.model.get('relativeImportance');
            ri.surface = surfaceRI / t;
            ri.column = columnRI / t;
            ri.shoreline = shorelineRI / t;

            // update ui
            this.$('#surfaceRI').html((ri.surface*100).toFixed(3));
            this.$('#columnRI').html((ri.column*100).toFixed(3));
            this.$('#shorelineRI').html((ri.shoreline*100).toFixed(3));

            this.updateBenefit();
        },

        updateBenefit: function(){
            var ri = this.model.get('relativeImportance');
            var surface = this.model.get('surface');
            var column = this.model.get('column');
            var shoreline = this.model.get('shoreline');
            var benefit = (1 - (ri.surface * surface + ri.column * column + ri.shoreline * shoreline)) * this.benefitGauge.maxValue;

            // update ui
            this.$('#surface').html((surface).toFixed(3));
            this.$('#column').html((column).toFixed(3));
            this.$('#shoreline').html((shoreline).toFixed(3));

            this.benefitGauge.set(benefit);
        }

    });

    return riskForm;
});
