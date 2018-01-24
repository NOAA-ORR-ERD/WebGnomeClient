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
], function(_, $, Backbone, Cesium, BaseModel, GnomeRelease, GnomeElement, nucos, moment, Appearance, AppearanceCollection){
    'use strict';
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',
        default_appearances: [
            {
                on: true,
                certain_LE_color: 'BLACK',
                uncertain_LE_color: 'RED',
                alpha: 1,
                scale: 1,
                id: 'les'
            },
            {
                on: true,
                id: 'loc'
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
            this.les = new Cesium.BillboardCollection({
                blendOption: Cesium.BlendOption.TRANSLUCENT,
            });
            this.genLEImages();
            this._locVis = new Cesium.Entity({
                name: this.get('name'),
                id: this.get('id') + '_loc',
                position: new Cesium.Cartesian3.fromDegrees(this.get('release').get('start_position')[0], this.get('release').get('start_position')[1]),
                billboard: {
                    image: '/img/spill-pin.png',
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                },
                description: '<table class="table"><tbody><tr><td>Amount</td><td>' + this.get('amount') + ' ' + this.get('units') + '</td></tr></tbody></table>',
                show: this.get('_appearance').findWhere({id:'loc'}).get('on'),
            });
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

        update: function(step) {
            //This function needs to be adapted to only store the LEs associated with it's spill number.
            //Currently it displays all particles in SpillJsonOutput. This is incorrect behavior.
            var certain = step.get('SpillJsonOutput').certain[0];
            var uncertain = step.get('SpillJsonOutput').uncertain[0];
            var appearance = this.get('_appearance').findWhere({id:'les'});

            if(uncertain) {
                for(f = 0; f < uncertain.length; f++){
                    if(!this._uncertain[f]){
                        // create a new point
                        this._uncertain.push(
                            this.les.add({
                                position: Cesium.Cartesian3.fromDegrees(uncertain.longitude[f], uncertain.latitude[f]),
                                color: Cesium.Color[this.get('_appearance').findWhere({id:'les'}).get('uncertain_LE_color')].withAlpha(
                                    uncertain.mass[f] / webgnome.model.get('spills').at(uncertain.spill_num[f])._per_le_mass
                                ),
                                eyeOffset : new Cesium.Cartesian3(0,0,-2),
                                image: uncertain.status === 2 ? this.les_point_image : this.les_beached_image,
                                show: appearance.get('on'),
                            })
                        );
                    } else {
                        this._uncertain[f].show = appearance.get('on');
                        this._uncertain[f].position = Cesium.Cartesian3.fromDegrees(uncertain.longitude[f], uncertain.latitude[f]);

                        if(uncertain.status[f] === 3){
                            this._uncertain[f].image = this._les_beached_image;
                        } else {
                            this._uncertain[f].image = this._les_point_image;
                        }

                        // set the opacity of particle if the mass has changed
                        if(uncertain.mass[f] !== webgnome.model.get('spills').at(uncertain.spill_num[f])._per_le_mass){
                            this._uncertain[f].color = Cesium.Color.RED.withAlpha(
                                uncertain.mass[f] / webgnome.model.get('spills').at(uncertain.spill_num[f])._per_le_mass
                            );
                        }
                    }
                }
            }
            for(var f = 0; f < certain.length; f++){
                if(!this._certain[f]){
                    // create a new point
                    this._certain.push(this.les.add({
                        position: Cesium.Cartesian3.fromDegrees(certain.longitude[f], certain.latitude[f]),
                        color: Cesium.Color[this.get('_appearance').findWhere({id:'les'}).get('certain_LE_color')].withAlpha(
                            certain.mass[f] / webgnome.model.get('spills').at(certain.spill_num[f])._per_le_mass
                        ),
                        eyeOffset : new Cesium.Cartesian3(0,0,-2),
                        image: certain.status[f] === 2 ? this.les_point_image : this.les_beached_image,
                                show: appearance.get('on'),
                    }));
                } else {
                    // update the point position and graphical representation
                    this._certain[f].show = appearance.get('on');
                    this._certain[f].position = Cesium.Cartesian3.fromDegrees(certain.longitude[f], certain.latitude[f]);
                    if(certain.status[f] === 3){
                        this._certain[f].image = this._les_beached_image;
                    } else {
                        this._certain[f].image = this._les_point_image;
                    }
                    // set the opacity of particle if the mass has changed
                    if(certain.mass[f] !== webgnome.model.get('spills').at(certain.spill_num[f])._per_le_mass){
                        this._certain[f].color = Cesium.Color.BLACK.withAlpha(
                            certain.mass[f] / webgnome.model.get('spills').at(certain.spill_num[f])._per_le_mass
                        );
                    }
                }
            }
            if(this._certain.length > certain.length){
                // we have entites that were created for a future step but the model is now viewing a previous step
                // hide the leftover particles
                var l;
                for(l = certain.length; l < this._certain.length; l++){
                    this._certain[l].show = false;
                }
                if(uncertain) {
                    for(l = uncertain.length; l < this._uncertain.length; l++){
                        this._uncertain[l].show = false;
                    }
                }
            }
        },

        updateVis: function(options) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if(options) {
                if(options.id === 'les') {
                    var bbs = this.les._billboards;
                    var appearance = this.get('_appearance').findWhere({id:'les'});
                    if (appearance.changedAttributes()){
                        for(var i = 0; i < bbs.length; i++) {
                            //bbs[i].color = Cesium.Color[appearance.get('color')];
                            //bbs[i].alpha = appearance.get('alpha');
                            //bbs[i].scale = appearance.get('scale');
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
