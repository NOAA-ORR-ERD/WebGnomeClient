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
        gauge: null,

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

//            this.update();
        },

        createBenefitGauge: function(selector, value){
            var opts = {
                angle: 0, // The length of each line
//                lineWidth: 0.2, // The line thickness
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
                percentColors: [[0.0, "#ff0000"],[0.50, "#ffff00"],[1.0, "#00ff00"]]
            };
            var target = document.getElementById('benefit'); // your canvas element
            this.gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
            this.gauge.maxValue = 100; // set max gauge value
            this.gauge.animationSpeed = 90; // set animation speed (32 is default value)
            this.gauge.set(value); // set actual value
        },

        createRelativeImportanceInput: function(selector, value){
            var canvas = this.__canvas = new fabric.Canvas(selector, { selection: false });
            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

            function makeCircle(left, top, s, l1, l2, l3, t) {
                var c = new fabric.Circle({
                              left: left,
                              top: top,
                              strokeWidth: 5,
                              radius: 5,
                              fill: '#fff',
                              stroke: '#666',
                              selectable: s
                });
                c.hasControls = c.hasBorders = false;

                c.l1 = l1;
                c.l2 = l2;
                c.l3 = l3;

                if (t !== null) {
                    c.t = new fabric.Text(t, {
                                left: left+35,
                                top: top,
                                fontSize: 10,
                                evented: false
                    });
                    canvas.add(c.t);
                }

                return c;
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
                makeCircle(line1.get('x1'), line1.get('y1'), false, null,  line1, null,  'surface'),
                makeCircle(line1.get('x2'), line1.get('y2'), true,  line1, line2, line3, null),
                makeCircle(line2.get('x2'), line2.get('y2'), false, line2, null,  null,  'column'),
                makeCircle(line3.get('x2'), line3.get('y2'), false, line3, null,  null,  'shoreline')
            );

            canvas.on('object:moving', _.bind(function(e) {
                var p = e.target;
                p.l1 && p.l1.set({ 'x2': p.left, 'y2': p.top });
                p.l2 && p.l2.set({ 'x1': p.left, 'y1': p.top });
                p.l3 && p.l3.set({ 'x1': p.left, 'y1': p.top });
                canvas.renderAll();
                this.update();
            }, this));

            canvas.renderAll();
        },

        createSlider: function(selector, value){
            this.$(selector).slider({
                    max: 100,
                    min: 0,
//orientation: 'vertical',
                    value: value,
                    create: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + value + '</div></div>');
                        }, this),
                    slide: _.bind(function(e, ui){
                           this.$(selector+' .ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-inner">' + ui.value + '</div></div>');
                        }, this),
                    stop: _.bind(function(e, ui){
                            this.update();
                        }, this)
            });
        },

        update: function(){
            var efficiency = this.model.get('efficiency');
            efficiency.skimming = this.$('.slider-skimming').slider('value');
            efficiency.dispersant = this.$('.slider-dispersant').slider('value');
            efficiency.insitu_burn = this.$('.slider-in-situ-burn').slider('value');
console.log('efficiencies ' , efficiency.skimming, efficiency.dispersant, efficiency.insitu_burn);

            this.$('#surface').html((efficiency.skimming/100).toFixed(3));
            this.$('#column').html((efficiency.dispersant/100).toFixed(3));
            this.$('#shoreline').html((efficiency.insitu_burn/100).toFixed(3));

            var canvas = this.__canvas;
            var s = canvas._objects[0];
            var surfaceRI = Math.sqrt(((s.x1-s.x2)*(s.x1-s.x2)) + ((s.y1-s.y2)*(s.y1-s.y2)))
            var c = canvas._objects[1];
            var columnRI = Math.sqrt(((c.x1-c.x2)*(c.x1-c.x2)) + ((c.y1-c.y2)*(c.y1-c.y2)))
            var l = canvas._objects[2];
            var shorelineRI = Math.sqrt(((l.x1-l.x2)*(l.x1-l.x2)) + ((l.y1-l.y2)*(l.y1-l.y2)))
            var t = surfaceRI+columnRI+shorelineRI;
            surfaceRI = surfaceRI / t;
            columnRI = columnRI / t;
            shorelineRI = shorelineRI / t;
console.log('lengths ', surfaceRI, columnRI, shorelineRI, (surfaceRI+columnRI+shorelineRI));

//            this.model.set('surface', surface);
//            this.model.set('column', column);
//            this.model.set('shoreline', shoreline);

            this.$('#surfaceRI').html((surfaceRI*100).toFixed(3));
            this.$('#columnRI').html((columnRI*100).toFixed(3));
            this.$('#shorelineRI').html((shorelineRI*100).toFixed(3));

            var benefit = (1 - (surfaceRI * this.model.get('surface') + columnRI * this.model.get('column') + shorelineRI * this.model.get('shoreline'))) * this.gauge.maxValue;
console.log('benefit is ', benefit);
            this.gauge.set(benefit);
        }

    });

    return riskForm;
});
