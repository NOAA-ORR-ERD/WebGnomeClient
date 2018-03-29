define([
    'underscore',
    'jquery',
    'backbone',
    'cesium',
    'model/base',
    'model/release',
    'model/element',
    'nucos',
    'moment',
    'model/appearance',
    'collection/appearances',
    'd3',
    'json!model/defaultSpillAppearances.json'
], function(_, $, Backbone, Cesium, BaseModel, GnomeRelease, GnomeElement, nucos, moment, Appearance, AppearanceCollection, d3, DefaultSpillAppearances){
    'use strict';
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',
        default_appearances: [
            {
                on: true,
                ctrl_names: {title:'Pin Appearance',
                             on: 'Show',
                            },
                id: 'loc'
            },
            {
                on: true,
                scale: 1,
                id: 'les',
                data: 'Mass',
                datavis: DefaultSpillAppearances['Mass'],
                ctrl_names: {title:'LE Appearance',
                             on: 'Show',
                             scale: 'Scale',
                            },
            }
        ],

        defaults: function(){
            return {
                'on': true,
                'obj_type': 'gnome.spill.spill.Spill',
                'release': new GnomeRelease(),
                'element_type': this.getElementType(),
                'name': 'Spill',
                'amount': 100,
                'units': 'bbl' //old code setting to kg for non-weathering substance is commented below
            };
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            this.les = new Cesium.BillboardCollection({
                blendOption: Cesium.BlendOption.TRANSLUCENT,
            });
            this._locVis = new Cesium.Entity();
            this.get('_appearance').fetch().then(_.bind(this.setupVis, this));
            if(webgnome.hasModel() && webgnome.model.getElementType()){
                this.set('element_type', webgnome.model.getElementType());
            }
            /*    if (!_.isNull(this.get('element_type').get('substance')) && this.isNew()) {
                    this.set('units', 'bbl');
                } else if(this.isNew()) {
                    this.set('units', 'kg');
                }
            } else if(this.isNew()) {
                this.set('units', 'kg');
            }*/
            this.on('change', this.calculate, this);
            this.on('change:element_type', this.addListeners, this);
            this.on('change:release', this.addListeners, this);
            this.addListeners();
            this.calculate();
            if (!this.isNew()) {
                if(webgnome.hasModel()){
                    this.isTimeValid();
                } else {
                    setTimeout(_.bind(this.isTimeValid,this),2);
                }   
            }
            this._certain = [];
            this._uncertain = [];
        },

        setupVis: function(attrs) {
            var viscfg = this.get('_appearance').get('datavis');
            this.setColorScales();
            this.genLEImages();
            this._locVis.merge(new Cesium.Entity({
                name: this.get('name'),
                id: this.get('id') + '_loc',
                position: new Cesium.Cartesian3.fromDegrees(this.get('release').get('start_position')[0], this.get('release').get('start_position')[1]),
                billboard: {
                    image: '/img/spill-pin.png',
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                },
                description: '<table class="table"><tbody><tr><td>Amount</td><td>' + this.get('amount') + ' ' + this.get('units') + '</td></tr></tbody></table>',
                show: this.get('_appearance').findWhere({id:'loc'}).get('on'),
            }));
        },

        resetLEs: function() {
            this.les.removeAll();
            this._uncertain = [];
            this._certain = [];
        },

        calculate: function(){
            this.calculateSI();
            this.calculatePerLEMass();
        },

        calculatePerLEMass: function(){
            if(this.get('release')){
                this._per_le_mass = this._amount_si / this.get('release').get('num_elements');
            } else {
                this._per_le_mass = 0;
            }
        },

        calculateSI: function(){
            var oilConverter = new nucos.OilQuantityConverter();
            this._amount_si = oilConverter.Convert(this.get('amount'), this.get('units'), this.get('element_type').get('standard_density'), 'kg/m^3', 'kg');
        },

        parseDuration: function(){
            var start = this.get('release').get('release_time');
            var end = this.get('release').get('end_release_time');
            var duration = (moment(end).unix() - moment(start).unix()) * 1000;
            var days = 0;
            var hours = 0;
            if (!_.isUndefined(duration)){
                hours = moment.duration(duration).asHours();
                if (hours >= 24){
                    days = parseInt(moment.duration(duration).asDays(), 10);
                }
                hours = hours - (days * 24);
            }
            return {'days': days, 'hours': hours};
        },

        spillType: function() {
            var start_time = this.get('release').get('release_time');
            var end_time = this.get('release').get('end_release_time');
            var str;

            if (start_time === end_time) {
                str = "instant";
            } else {
                str = "continuous";
            }

            return str;
        },

        resetListeners:function(){
            this.stopListening();
            this.addListeners();
        },

        addListeners: function(){
            this.listenTo(this.get('element_type'), 'change', this.elementTypeChange);
            this.listenTo(this.get('release'), 'change', this.releaseChange);
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this.listenTo(this.get('release'), 'change', _.bind(function(){
                this._locVis.position = new Cesium.Cartesian3.fromDegrees(this.get('release').get('start_position')[0],
                                                                          this.get('release').get('start_position')[1]);
            },this));
        },

        releaseChange: function(release) {
            this.childChange('release', release);
        },

        elementTypeChange: function(element_type){
            this.childChange('element_type', element_type);
        },

        getElementType: function(){
            if(webgnome.hasModel() && webgnome.model.getElementType()){
                return webgnome.model.getElementType();
            } else {
                return new GnomeElement();
            }
        },

        validate: function(attrs, options){

            if ($.trim(attrs.name) === ''){
                this.validationContext = 'spill';
                return 'A spill name is required!';
            }

            var amount = this.validateAmount(attrs);
            if(amount){
                return amount;
            }

            if(!attrs.release.isValid()){
                this.validationContext = 'map';
                return attrs.release.validationError;
            }
            this.validationContext = null;
        },

        validateSubstance: function(attrs){
            if (_.isUndefined(attrs)){
                attrs = this.attributes;
            }
//            var substance = attrs.element_type.get('substance');
//            var massUnits = ['kg', 'ton', 'metric ton'];
//            if(_.isNull(substance) && massUnits.indexOf(attrs.units) === -1){
//                return 'Amount released must use units of mass when using non-weathering substance!\n\nAcceptable units: kilograms, tons, metric tons';
//           }
        },

        validateSections: function(){
            var attrs = this.attributes;
            this.validateAmount(attrs);
            this.validateSubstance(attrs);
            this.validateLocation(attrs);
        },

        validateAmount: function(attrs){
            var massUnits = ['kg', 'ton', 'metric ton'];

            if (_.isUndefined(attrs)){
                attrs = this.attributes;
            }
            if(isNaN(attrs.amount)){
                this.validationContext = 'info';
                return 'Amount must be a number';
            } else if (!attrs.units) {
                this.validationContext = 'info';
                return 'A unit for amount must be selected';
            }

            var substance = attrs.element_type.get('substance');
            if(!_.isNull(substance) && attrs.amount > 0){
                // if there is a substance and an amount is defined it should be greater than 1 bbl
                var oilConverter = new nucos.OilQuantityConverter();
                var bbl = oilConverter.Convert(attrs.amount, attrs.units, substance.api, 'API Degree', 'bbl');
                var contextualLimit = oilConverter.Convert(1, 'bbl', substance.api, 'API Degree', attrs.units).toFixed(2);
                if(bbl < 1){
                    return 'Amount must be greater than ' + contextualLimit + ' ' + attrs.units + ' when using a weatherable substance';
                }
            } else if(attrs.amount <= 0) {
                return 'Amount must be greater than 0';
            }

            //if (massUnits.indexOf(attrs.units) === -1 && _.isNull(substance)){
                //this.validationContext = 'info';
                //return 'Amount released must use units of mass when using non-weathering substance!';
            //}

            // if(nucos.convert)
        },

        validateLocation: function(attrs){
            var release = this.get('release');
            if (_.isUndefined(attrs)){
                attrs = release.attributes;
            }

            return release.validateLocation(attrs);
        },
        
        isTimeValid: function() {
            var model_start = webgnome.model.get('start_time');
            var model_stop = webgnome.model.getEndTime();
            var spill_start = this.get('release').get('release_time');
            var msg = "";
            
            if((spill_start > model_start) & (spill_start < model_stop)) {
                    msg = "The spill starts after the model start time";
                    this.set('time_compliance', 'semivalid');
                }
            else if(spill_start < model_start) {
                msg = "The spill starts before the model start time";
                this.set('time_compliance', 'invalid');
            }
            else if(spill_start >= model_stop) {
                msg = "The spill starts after the model end time";
                this.set('time_compliance','invalid');
            }
            else { 
                this.set('time_compliance', 'valid');
            }
            
            return msg;

        },

        toTree: function(){
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var on = this.get('on');
            var name = this.get('name');

            attrs.push({title: 'Spill Name: ' + name, key: 'Spill Name',
                         obj_type: this.get('name'), action: 'edit', object: this});
            attrs.push({title: 'On: ' + on, key: 'On', obj_type: this.get('on'), action: 'edit', object: this});

            tree = attrs.concat(tree);

            return tree;
        },

        genLEImages: function() {
            var canvas = document.createElement('canvas');
            canvas.width = 4;
            canvas.height = 4;
            var context2D = canvas.getContext('2d');
            context2D.beginPath();
            context2D.arc(2, 2, 2, 0, Cesium.Math.TWO_PI, true);
            context2D.closePath();
            context2D.fillStyle = 'rgb(255, 255, 255)';
            context2D.fill();
            this._les_point_image = this.les.add({image: canvas, show: false}).image;

            canvas = document.createElement('canvas');
            canvas.width = 10;
            canvas.height = 10;
            context2D = canvas.getContext('2d');
            context2D.moveTo(0, 0);
            context2D.lineTo(8, 8);
            context2D.moveTo(8, 7);
            context2D.lineTo(1, 0);
            context2D.moveTo(0, 1);
            context2D.lineTo(7, 8);

            context2D.moveTo(0, 8);
            context2D.lineTo(8, 0);
            context2D.moveTo(7, 0);
            context2D.lineTo(0, 7);
            context2D.moveTo(1, 8);
            context2D.lineTo(8, 1);

            context2D.strokeStyle = 'rgb(255, 255, 255)';
            context2D.stroke();
            this._les_beached_image = this.les.add({image: canvas, show: false}).image;
        },

        setColorScales: function() {
            /*
            Call this function to reconfigure the scales used to convert a data value into a color to be applied
            */
            var config = this.get('_appearance').findWhere({id:'les'}).get('datavis');
            var numScaleType = config.number_scale_config['type'];
            if (numScaleType === 'linear') {
                this._numScale = d3.scaleLinear()
                                   .domain(config.number_scale_config.domain);
            } else if (numScaleType === 'log') {
                this._numScale = d3.scaleLog()
                                   .domain(config.number_scale_config.domain);
            }
            var colorScaleType = config.color_scale_config['type'];
            var nColors = config.nColors;
            //config.colors = d3['scheme' + config._chosenScheme][nColors];
            var colrange = config.colors.length === 1 ? config.colors.push(config.colors[0]) : config.colors;
            
            if (colorScaleType === 'threshold') {
                this._colorScale = d3.scaleThreshold()
                                   .domain(config.color_scale_config.domain)
                                   .range(config.colors)
            } else if (colorScaleType === 'linear') {
                this._colorScale = d3.scaleLinear()
                                   .domain(0,1)
                                   .range(config.colors)
            }
        },

        colorLEs: function(){
            /*
            Uses the appearance's datavis object to determine how to colorize all the LEs
            */
            var config = this.get('_appearance').findWhere({id:'les'}).get('datavis');
            var genColorwithAlpha = function(colorStr, alpha) {
                return alpha ? 
                    Cesium.Color.fromCssColorString(colorStr).withAlpha(alpha) :
                    Cesium.Color.fromCssColorString(colorStr);
            };
            var alphaScale;
            alphaScale = d3.scaleLinear();
            if (config.alphaType === 'mass') {
                alphaScale.domain([0, this._per_le_mass]);
            } else {
                alphaScale.domain([2000, 0]);
            }
            var value, color, alpha, i, datatype;
            datatype = config.title.toLowerCase()
            if(config._chosenColorMapType === "Alpha") {
                for (i = 0; i < this._certain.length; i++) {
                    value = this._certain[i][datatype];
                    color = config.colors[0];
                    alpha = alphaScale(value);
                    this._certain[i].color = genColorwithAlpha(color, alpha);
                }
                for (i = 0; i < this._uncertain.length; i++) {
                    value = this._uncertain[i][datatype];
                    color = config.uncertain_colors[0];
                    alpha = alphaScale(value);
                    this._uncertain[i].color = genColorwithAlpha(color, alpha);
                } 
            } else if(config._chosenColorMapType === "Diverging") {
                for (i = 0; i < this._certain.length; i++) {
                    value = this._certain[i][datatype];
                    color = this._colorScale(this._numScale(value));
                    if (config.useAlpha) {
                        alpha = alphaScale(this._certain[i][config.alphaType]);
                    }
                    this._certain[i].color = genColorwithAlpha(color, alpha);
                }
            } else if (config._chosenColorMapType === "Sequential") {
                for (i = 0; i < this._certain.length; i++) {
                    value = this._certain[i][config.title.toLowerCase()];
                    color = this._colorScale(this._numScale(value));
                    if (config.useAlpha) {
                        alpha = alphaScale(this._certain[i][config.alphaType]);
                    }
                    this._certain[i].color = genColorwithAlpha(color, alpha);
                }
            }
        },

        update: function(step) {
            var certain = step.get('SpillJsonOutput').certain[0];
            var uncertain = step.get('SpillJsonOutput').uncertain[0];
            var sid = webgnome.model.get('spills').indexOf(this);

            var appearance = this.get('_appearance').findWhere({id:'les'});
            var le_idx = 0;
            var newLE;
            if(uncertain) {
                for(f = 0; f < uncertain.length; f++){
                    if (uncertain.spill_num[f] === sid) {
                        if(!this._uncertain[le_idx]){
                            // create a new point
                            newLE = this.les.add({
                                position: Cesium.Cartesian3.fromDegrees(uncertain.longitude[f], uncertain.latitude[f]),
                                eyeOffset : new Cesium.Cartesian3(0,0,-2),
                                image: uncertain.status === 2 ? this.les_point_image : this.les_beached_image,
                                show: appearance.get('on'),
                            });
                            newLE.mass = uncertain.mass[f];
                            newLE.depth = uncertain.depth ? uncertain.depth[f] : undefined;
                            newLE.viscosity = uncertain.viscosity ? uncertain.viscosity[f]: undefined;
                            newLE.age = uncertain.age ? uncertain.age[f]: undefined;
                            this._uncertain.push(newLE);
                        } else {
                            this._uncertain[le_idx].show = appearance.get('on');
                            this._uncertain[le_idx].position = Cesium.Cartesian3.fromDegrees(uncertain.longitude[f], uncertain.latitude[f]);
                            this._uncertain[le_idx].mass = uncertain.mass[f];

                            if(uncertain.status[f] === 3){
                                this._uncertain[le_idx].image = this._les_beached_image;
                            } else {
                                this._uncertain[le_idx].image = this._les_point_image;
                            }
                        }
                        le_idx++;
                    }
                }
            }
            le_idx = 0;
            for(var f = 0; f < certain.length; f++){
                if (certain.spill_num[f] === sid) {
                    if(!this._certain[le_idx]){
                        // create a new point
                        newLE = this.les.add({
                            position: Cesium.Cartesian3.fromDegrees(certain.longitude[f], certain.latitude[f]),
                            eyeOffset : new Cesium.Cartesian3(0,0,-2),
                            image: certain.status[f] === 2 ? this.les_point_image : this.les_beached_image,
                                    show: appearance.get('on'),
                        });
                        newLE.mass = certain.mass[f];
                        this._certain.push(newLE);
                    } else {
                        // update the point position and graphical representation
                        this._certain[le_idx].show = appearance.get('on');
                        this._certain[le_idx].position = Cesium.Cartesian3.fromDegrees(certain.longitude[f], certain.latitude[f]);
                        this._certain[le_idx].mass = certain.mass[f];
                        if(certain.status[f] === 3){
                            this._certain[le_idx].image = this._les_beached_image;
                        } else {
                            this._certain[le_idx].image = this._les_point_image;
                        }
                    }
                    le_idx++;
                }
            }
            var c_len = certain.spill_num.filter(function(sn) { return sn === sid; }).length;
            if(this._certain.length > c_len){
                // we have entites that were created for a future step but the model is now viewing a previous step
                // hide the leftover particles
                var l;
                for(l = c_len; l < this._certain.length; l++){
                    this._certain[l].show = false;
                }
                if(uncertain) {
                    var u_len = uncertain.spill_num.filter(function(sn) { return sn === sid; }).length;
                    for(l = u_len; l < this._uncertain.length; l++){
                        this._uncertain[l].show = false;
                    }
                }
            }
            this.colorLEs();
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if(options) {
                if(options.id === 'les') {
                    var bbs = this.les._billboards;
                    var appearance = this.get('_appearance').findWhere({id:'les'});
                    var changedAttrs, newColor, i;
                    changedAttrs = appearance.changedAttributes();
                    if (changedAttrs){
                        if(changedAttrs.data) {
                            appearance.set('datavis', DefaultSpillAppearances[changedAttrs.data]);
                        }
                        for(i = 0; i < bbs.length; i++) {
                            bbs[i].scale = appearance.get('scale');
                            bbs[i].show = appearance.get('on');
                        }
                    }
                } else {
                    var visObj = this._locVis;
                    if (options.changedAttributes()){
                        visObj.show = options.get('on');
                    }
                }
            }
        },

    });

    return gnomeSpill;

});
