define([
    'underscore',
    'jquery',
    'backbone',
    'cesium',
    'moment',
    'd3',
    'nucos',
    'model/base',
    'model/spill/release',
    'model/spill/nonweatheringsubstance',
    'model/spill/gnomeoil',
    'model/visualization/appearance',
    'model/visualization/spill_appearance'
    ], function(_, $, Backbone, Cesium, moment, d3, nucos,
            BaseModel, GnomeRelease, NonWeatheringSubstance, GnomeOil,
            Appearance, SpillAppearance) {
    'use strict';
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',

        defaults: function() {
            return {
                'on': true,
                'obj_type': 'gnome.spill.spill.Spill',
                'release': new GnomeRelease(),
                'substance': new NonWeatheringSubstance(),
                'name': 'Spill',
                'amount': 100,
                'units': 'bbl',
                '_appearance': new SpillAppearance()
            };
        },

        model: {
            release: GnomeRelease,
            substance: NonWeatheringSubstance,
            _appearance: SpillAppearance
        },

        initialize: function(options) {
            var oldsavetrigger = false;
            if (options && _.has(options, 'id') && !_.has(options,'_appearance')) {
                oldsavetrigger = true;
            }
            BaseModel.prototype.initialize.call(this, options);

            this.les = new Cesium.BillboardCollection({
                blendOption: Cesium.BlendOption.TRANSLUCENT,
            });

            this._locVis = new Cesium.EntityCollection();

            this.calculate();
            this.initializeDataVis(options);
            this.setupVis();

            if (webgnome.hasModel() && webgnome.model.getSubstance()) {
                this.set('substance', webgnome.model.getSubstance());
            }

            this.on('change', this.calculate, this);
            this.on('change:substance', this.addListeners, this);
            this.on('change:release', this.addListeners, this);

            //this.listenTo(this, 'change', this.initializeDataVis);

            this.addListeners();

            if (!this.isNew()) {
                if (webgnome.hasModel()) {
                    this.isTimeValid();
                }
                else {
                    setTimeout(_.bind(this.isTimeValid, this), 2);
                }
            }

            this._certain = [];
            this._uncertain = [];
            this.get('_appearance').setUnitConversionFunction(undefined, this.get('units'));
            if (oldsavetrigger) {
                this.save();
            }
        },

        getBoundingRectangle: function() {
            var llcorner = this.get('release').get('start_position').map(function(e){return e - 10;});
            var rucorner = this.get('release').get('start_position').map(function(e){return e + 10;});
            var spillPinRect = Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray([llcorner[0], llcorner[1], rucorner[0], rucorner[1]]));

            return new Promise(_.bind(function(resolve, reject) {
                resolve(spillPinRect);
            }));
        },

        initializeDataVis: function(options) {
            // Contextualizing the default appearance for the properties
            // of this spill
            var data = this.get('_appearance').get('data');
            var colormap = this.get('_appearance').get('colormap');
            var max, min, newScaleType;
            colormap.initScales();

            if (!options || !_.has(options, '_appearance')) {
                if (data === 'Age') {
                    min = 0;
                    max = webgnome.model.get('num_time_steps') * webgnome.model.get('time_step');
                    newScaleType = 'linear';
                }
                else if (data === 'Surface Concentration') {
                    min = 0.0001;
                    max = this.estimateMaxConcentration();
                    newScaleType = 'log';
                }
                else if (data === 'Viscosity') {
                    min = 0.0000001;
                    max = 250000;
                    newScaleType = 'log';
                }
                else if (data === 'Depth') {
                    min = 0;
                    max = 100;
                    newScaleType = 'linear';
                }
                else {
                    min = 0;
                    max = this._per_le_mass;
                    newScaleType = 'linear';
                }
                colormap.setDomain(min, max, newScaleType);
            }
            this.setColorScales();
        },

        setColorScales: function() {
            // Call this function to reconfigure the scales used to convert
            // a data value into a color to be applied
            var colormap = this.get('_appearance').get('colormap');

            if (colormap.get('numberScaleType') === 'linear') {
                this._numScale = d3.scaleLinear();
            }
            else if (colormap.get('numberScaleType') === 'log') {
                this._numScale = d3.scaleLog();
            }

            this._numScale.domain(colormap.get('numberScaleDomain'))
                .range(colormap.get('numberScaleRange'));

            if (colormap.get('colorScaleType') === 'threshold') {
                this._colorScale = d3.scaleThreshold();
            }
            else if (colormap.get('colorScaleType') === 'linear') {
                this._colorScale = d3.scaleLinear();
            }

            this._colorScale.domain(colormap.get('colorScaleDomain'))
                .range(colormap.get('colorScaleRange'));
        },

        setupVis: function(attrs) {
            this.listenTo(this.get('_appearance'), 'change:data',
                          this.initializeDataVis);
            this.listenTo(this.get('_appearance'), 'resetToDefault',
                          this.initializeDataVis);
            this.setColorScales();
            this.genLEImages();
            this._locVis = this.get('release')._visObj;
/*
            this._locVis.merge(new Cesium.Entity({
                name: this.get('name'),
                id: this.get('id') + '_loc',
                position: new Cesium.Cartesian3.fromDegrees(this.get('release').get('start_position')[0], this.get('release').get('start_position')[1]),
                billboard: {
                    image: '/img/spill-pin.png',
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                },
                description: '<table class="table"><tbody><tr><td>Amount</td><td>' + this.get('amount') + ' ' + this.get('units') + '</td></tr></tbody></table>',
                show: this.get('_appearance').get('pin_on'),
            }));
*/
        },

        resetLEs: function() {
            if (!_.isUndefined(this.les.textureAtlas)){
                this.les.removeAll();
            }
            this._uncertain = [];
            this._certain = [];
        },

        calculate: function() {
            this.calculateSI();
            this.calculatePerLEMass();
        },

        calculatePerLEMass: function() {
            if (this.get('release')) {
                this._per_le_mass = this._amount_si / this.get('release').get('num_elements');
            }
            else {
                this._per_le_mass = 0;
            }
        },

        estimateMaxConcentration: function() {
            var time_step = webgnome.model.get('time_step');
            var diff_coef = 10;
            var diff_mover = webgnome.model.get('movers').findWhere({'obj_type': 'gnome.movers.random_movers.RandomMover'});
            if (diff_mover) {
                diff_coef = diff_mover.get('diffusion_coef') / 10000;
            }
            var max_random_walk = Math.sqrt((6*diff_coef)*time_step);
            var area = Math.PI * max_random_walk * max_random_walk;

            var release_duration = this.get('release').getDuration();
            var amt = 0;
            if (release_duration === 0) {
                amt = this._amount_si;
            } else {
                var numTS = Math.ceil(release_duration / time_step);
                amt = this._amount_si / numTS;
            }

            var est_avg_conc = amt/area;
            return est_avg_conc;
        },

        calculateSI: function() {
            var oilConverter = new nucos.OilQuantityConverter();
            this._amount_si = oilConverter.Convert(this.get('amount'),
                                                   this.get('units'),
                                                   this.get('substance').get('standard_density'),
                                                   'kg/m^3', 'kg');
        },

        parseDuration: function() {
            var start = this.get('release').get('release_time');
            var end = this.get('release').get('end_release_time');

            var duration = (moment(end).unix() - moment(start).unix()) * 1000;

            var days = 0;
            var hours = 0;

            if (!_.isUndefined(duration)) {
                hours = moment.duration(duration).asHours();

                if (hours >= 24) {
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
            }
            else {
                str = "continuous";
            }

            return str;
        },

        resetListeners:function() {
            this.stopListening();
            this.addListeners();
        },

        addListeners: function() {
            this.listenTo(this.get('substance'), 'change', this.substanceChange);
            this.listenTo(this.get('release'), 'change', this.releaseChange);
            this.listenTo(this.get('_appearance'), 'change', this._appearanceChange);
            this.listenTo(this.get('_appearance').get('colormap'), 'change', this.setColorScales);
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this.listenTo(this.get('substance'), 'change', this.initializeDataVis);
            this.listenTo(this.get('release'), 'change', this.initializeDataVis);
            this.listenTo(this, 'change:release', _.bind(function(){ this._locVis = this.get('release')._visObj; }, this));
        },

        releaseChange: function(release) {
            this.childChange('release', release);
        },

        substanceChange: function(substance) {
            this.childChange('substance', substance);
        },

        _appearanceChange: function(_appearance) {
            this.childChange('_appearance', _appearance);
        },

        getSubstance: function() {
            if (webgnome.hasModel() && webgnome.model.getSubstance()) {
                return webgnome.model.getSubstance();
            }
            else {
                return new NonWeatheringSubstance();
            }
        },

        validate: function(attrs, options) {
            if ($.trim(attrs.name) === '') {
                this.validationContext = 'spill';
                return 'A spill name is required!';
            }

            var amount = this.validateAmount(attrs);
            if(amount) {
                return amount;
            }

            if (!attrs.release.isValid()) {
                this.validationContext = 'map';
                return attrs.release.validationError;
            }

            this.validationContext = null;
        },

        validateSubstance: function(attrs) {
            if (_.isUndefined(attrs)) {
                attrs = this.attributes;
            }
        },

        validateSections: function() {
            var attrs = this.attributes;

            this.validateAmount(attrs);
            this.validateSubstance(attrs);
            this.validateLocation(attrs);
        },

        validateAmount: function(attrs) {
            var massUnits = ['kg', 'ton', 'metric ton'];

            if (_.isUndefined(attrs)) {
                attrs = this.attributes;
            }

            if (isNaN(attrs.amount)) {
                this.validationContext = 'info';
                return 'Amount must be a number';
            }
            else if (!attrs.units) {
                this.validationContext = 'info';
                return 'A unit for amount must be selected';
            }

            var substance = attrs.substance;
            if (!_.isNull(substance) && attrs.amount > 0) {
                // if there is a substance and an amount is defined,
                // it should be greater than 1 bbl
                var oilConverter = new nucos.OilQuantityConverter();
                var bbl = oilConverter.Convert(attrs.amount, attrs.units,
                                               substance.api,
                                               'API Degree', 'bbl');
                var contextualLimit = oilConverter.Convert(1, 'bbl',
                                                           substance.api,
                                                           'API Degree',
                                                           attrs.units).toFixed(2);

                if (bbl < 1) {
                    return 'Amount must be greater than ' + contextualLimit + ' ' + attrs.units + ' when using a weatherable substance';
                }
            }
            else if (attrs.amount <= 0) {
                return 'Amount must be greater than 0';
            }
        },

        validateLocation: function(attrs) {
            var release = this.get('release');

            if (_.isUndefined(attrs)) {
                attrs = release.attributes;
            }

            return release.validateLocation(attrs);
        },

        isTimeValid: function() {
            var [model_start, model_stop] = webgnome.model.activeTimeRange();
            var [spill_start, spill_stop] = this.activeTimeRange();
            var msg = "";

            if ((spill_start > model_start) & (spill_start < model_stop)) {
                this.set('time_compliance', 'semivalid');
            }
            else if (spill_start < model_start) {
                msg = "The spill starts before the model start time";
                this.set('time_compliance', 'invalid');
            }
            else if (spill_start >= model_stop) {
                msg = "The spill starts after the model end time";
                this.set('time_compliance','invalid');
            }
            else {
                this.set('time_compliance', 'valid');
            }

            return msg;
        },

        activeTimeRange: function() {
            var release = this.get('release');

            return [webgnome.timeStringToSeconds(release.get('release_time')),
                    webgnome.timeStringToSeconds(release.get('end_release_time'))];
        },

        toTree: function() {
            var tree = Backbone.Model.prototype.toTree.call(this, false);
            var attrs = [];
            var on = this.get('on');
            var name = this.get('name');

            attrs.push({title: 'Spill Name: ' + name,
                        key: 'Spill Name',
                        obj_type: this.get('name'),
                        action: 'edit',
                        object: this});
            attrs.push({title: 'On: ' + on,
                        key: 'On',
                        obj_type: this.get('on'),
                        action: 'edit',
                        object: this});

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

        colorLEs: function() {
            // Uses the appearance's datavis object to determine how to
            // colorize all the LEs
            var colormap = this.get('_appearance').get('colormap');

            var genColorwithAlpha = function(colorStr, alpha) {
                return !_.isUndefined(alpha) ?
                    Cesium.Color.fromCssColorString(colorStr).withAlpha(alpha) :
                    Cesium.Color.fromCssColorString(colorStr);
            };

            var alphaScale;
            alphaScale = d3.scaleLinear();

            if (colormap.get('alphaType') === 'mass') {
                alphaScale.domain([0, this._per_le_mass]);
            }
            else {
                alphaScale.domain([2000, 0]);
            }

            var value, color, alpha, i, datatype;
            datatype = this.get('_appearance').get('data').toLowerCase().replace(/ /g, '_');

            for (i = 0; i < this._certain.length; i++) {
                value = this._certain[i][datatype];
                color = this._colorScale(value);

                if (_.isUndefined(color)) {
                    color = '#FF0000';
                }

                if (colormap.get('useAlpha')) {
                    alpha = alphaScale(this._certain[i][colormap.get('alphaType')]);
                }

                this._certain[i].color = genColorwithAlpha(color, alpha);
            }
        },

        update: function(step) {
            var certain = step.get('SpillJsonOutput').certain[0];
            var uncertain = step.get('SpillJsonOutput').uncertain[0];
            var sid = webgnome.model.get('spills').indexOf(this);

            var appearance = this.get('_appearance');
            var le_idx = 0;
            var newLE, additional_data;

            additional_data = this.get('_appearance').get('data') === 'Mass' ? undefined : this.get('_appearance').get('data').toLowerCase().replace(/ /g,'_');

            if (uncertain) {
                for (f = 0; f < uncertain.length; f++) {
                    if (uncertain.spill_num[f] === sid) {
                        if (!this._uncertain[le_idx]) {
                            // create a new point
                            newLE = this.les.add({
                                position: Cesium.Cartesian3.fromDegrees(uncertain.longitude[f],
                                                                        uncertain.latitude[f]),
                                eyeOffset : new Cesium.Cartesian3(0,0,-2),
                                image: uncertain.status === 2 ? this._les_point_image : this._les_beached_image,
                                show: appearance.get('les_on'),
                                color: Cesium.Color.RED
                            });

                            newLE.id = 'ULE' + le_idx;

                            if (additional_data) {
                                newLE[additional_data] = uncertain[additional_data][f];
                            }

                            newLE.mass = uncertain.mass[f];
                            this._uncertain.push(newLE);
                        }
                        else {
                            this._uncertain[le_idx].show = appearance.get('les_on');
                            this._uncertain[le_idx].position = Cesium.Cartesian3.fromDegrees(uncertain.longitude[f], uncertain.latitude[f]);
                            this._uncertain[le_idx].mass = uncertain.mass[f];

                            if (additional_data) {
                                this._uncertain[le_idx][additional_data] = uncertain[additional_data][f];
                            }

                            if (uncertain.status[f] === 3) {
                                this._uncertain[le_idx].image = this._les_beached_image;
                            }
                            else {
                                this._uncertain[le_idx].image = this._les_point_image;
                            }
                        }

                        le_idx++;
                    }
                }
            }

            le_idx = 0;

            for (var f = 0; f < certain.length; f++) {
                if (certain.spill_num[f] === sid) {
                    if (!this._certain[le_idx]) {
                        // create a new point
                        newLE = this.les.add({
                            position: Cesium.Cartesian3.fromDegrees(certain.longitude[f], certain.latitude[f]),
                            eyeOffset : new Cesium.Cartesian3(0,0,-2),
                            image: certain.status[f] === 2 ? this._les_point_image : this._les_beached_image,
                                    show: appearance.get('les_on'),
                        });

                        newLE.id = 'LE' + le_idx;
                        newLE.mass = certain.mass[f];

                        if (additional_data) {
                            newLE[additional_data] = certain[additional_data][f];
                        }

                        this._certain.push(newLE);
                    }
                    else {
                        // update the point position and graphical representation
                        this._certain[le_idx].show = appearance.get('les_on');
                        this._certain[le_idx].position = Cesium.Cartesian3.fromDegrees(certain.longitude[f],
                                                                                       certain.latitude[f]);
                        this._certain[le_idx].mass = certain.mass[f];

                        if (additional_data) {
                            this._certain[le_idx][additional_data] = certain[additional_data][f];
                        }

                        if (certain.status[f] === 3) {
                            this._certain[le_idx].image = this._les_beached_image;
                        }
                        else {
                            this._certain[le_idx].image = this._les_point_image;
                        }
                    }

                    le_idx++;
                }
            }

            var c_len = certain.spill_num.filter(function(sn) {
                return sn === sid;
            }).length;

            if (this._certain.length > c_len) {
                // we have entites that were created for a future step
                // but the model is now viewing a previous step
                // hide the leftover particles
                var l;

                for (l = c_len; l < this._certain.length; l++) {
                    this._certain[l].show = false;
                }

                if (uncertain) {
                    var u_len = uncertain.spill_num.filter(function(sn) {
                        return sn === sid;
                    }).length;

                    for (l = u_len; l < this._uncertain.length; l++) {
                        this._uncertain[l].show = false;
                    }
                }
            }

            this.colorLEs();
        },

        updateVis: function(appearance) {
            /* Updates the appearance of this model's graphics object. Implementation varies depending on
            the specific object type*/
            if (appearance) {
                var bbs = this.les._billboards;
                var newColor, i;

                //var changedAttrs = appearance.changedAttributes();
                //if (changedAttrs) {
                var scale = appearance.get('scale');
                var show = appearance.get('les_on');
                for (i = 0; i < bbs.length; i++) {
                    bbs[i].scale = scale;
                    bbs[i].show = show;
                }

                this.setColorScales();
                this.colorLEs();

                    //if ('pin_on' in changedAttrs) {
                for (i = 0 ; i < this._locVis.values.length; i++) {
                    this._locVis.values[i].show = appearance.get('pin_on');
                }
                    //}
            }
        },
    });

    return gnomeSpill;
});
