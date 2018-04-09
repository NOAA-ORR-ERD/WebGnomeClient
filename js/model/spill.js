define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'moment',
    'nucos',
    'model/base',
    'model/release',
    'model/element',
    'model/appearance',
    'collection/appearances',
], function($, _, Backbone, Cesium, moment, nucos,
            BaseModel, GnomeRelease, GnomeElement, Appearance,
            AppearanceCollection) {
    'use strict';
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',

        default_appearances: [
            {
                on: true,
                ctrl_name: 'LE Appearance',
                certain_LE_color: '#000000', // BLACK
                uncertain_LE_color: '#FF0000', // RED
                scale: 1,
                id: 'les'
            },
            {
                on: true,
                ctrl_name: 'Pin Appearance',
                id: 'loc'
            }
        ],

        defaults: function() {
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

            if (webgnome.hasModel() && webgnome.model.getElementType()) {
                this.set('element_type', webgnome.model.getElementType());
            }

            this.on('change', this.calculate, this);
            this.on('change:element_type', this.addListeners, this);
            this.on('change:release', this.addListeners, this);

            this.addListeners();

            this.calculate();

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

        resetLEs: function() {
            this.les.removeAll();
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

        calculateSI: function() {
            var oilConverter = new nucos.OilQuantityConverter();
            this._amount_si = oilConverter.Convert(this.get('amount'), this.get('units'), this.get('element_type').get('standard_density'), 'kg/m^3', 'kg');
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
            this.listenTo(this.get('element_type'), 'change', this.elementTypeChange);
            this.listenTo(this.get('release'), 'change', this.releaseChange);
            this.listenTo(this.get('_appearance'), 'change', this.updateVis);
            this.listenTo(this.get('release'), 'change', _.bind(function() {
                this._locVis.position = new Cesium.Cartesian3.fromDegrees(this.get('release').get('start_position')[0],
                                                                          this.get('release').get('start_position')[1]);
            },this));
        },

        releaseChange: function(release) {
            this.childChange('release', release);
        },

        elementTypeChange: function(element_type) {
            this.childChange('element_type', element_type);
        },

        getElementType: function() {
            if (webgnome.hasModel() && webgnome.model.getElementType()) {
                return webgnome.model.getElementType();
            }
            else {
                return new GnomeElement();
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

            var substance = attrs.element_type.get('substance');
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

            var spill_start = this.get('release').get('release_time');
            var msg = "";

            if ((spill_start > model_start) & (spill_start < model_stop)) {
                msg = "The spill starts after the model start time";
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

            return [this.parseTimeAttr(release.get('release_time')),
                    this.parseTimeAttr(release.get('end_release_time'))];
        },

        parseTimeAttr: function(timeAttr) {
            // timeAttr is a string value representing a date/time or a
            // positive or negative infinite value.
            if (timeAttr === 'inf') {
                return Number.POSITIVE_INFINITY;
            }
            else if (timeAttr === '-inf') {
                return Number.NEGATIVE_INFINITY;
            }
            else {
                return moment(timeAttr.replace('T',' ')).unix();
            }
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
            var gnome = new Image();

            gnome.onload = _.bind(function() {
                var canvas = document.createElement('canvas');
                canvas.height = 27;
                canvas.width = 14;

                var context2d = canvas.getContext('2d');
                context2d.drawImage(gnome, 0, 0);

                this._les_point_image = this.les.add({image: canvas,
                                                      show: false}).image;
            }, this);

            gnome.src = 'img/lagrangian_gnome.png';

            var canvas = document.createElement('canvas');
            canvas.width = 10;
            canvas.height = 10;

            var context2D = canvas.getContext('2d');
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

            this._les_beached_image = this.les.add({image: canvas,
                                                    show: false}).image;
        },

        update: function(step) {
            var certain = step.get('SpillJsonOutput').certain[0];
            var uncertain = step.get('SpillJsonOutput').uncertain[0];
            var sid = webgnome.model.get('spills').indexOf(this);

            var appearance = this.get('_appearance').findWhere({id:'les'});
            var le_idx = 0;
            var certain_LE_color, uncertain_LE_color;

            certain_LE_color = Cesium.Color.fromCssColorString(appearance.get('certain_LE_color'));
            uncertain_LE_color = Cesium.Color.fromCssColorString(appearance.get('uncertain_LE_color'));

            if (uncertain) {
                for (f = 0; f < uncertain.length; f++) {
                    if (uncertain.spill_num[f] === sid) {
                        if (!this._uncertain[le_idx]) {
                            // create a new point
                            this._uncertain.push(
                                this.les.add({
                                    position: Cesium.Cartesian3.fromDegrees(uncertain.longitude[f],
                                                                            uncertain.latitude[f]),
                                    color: uncertain_LE_color.withAlpha(
                                        uncertain.mass[f] / webgnome.model.get('spills').at(uncertain.spill_num[f])._per_le_mass
                                    ),
                                    eyeOffset : new Cesium.Cartesian3(0, 0, -2),
                                    image: uncertain.status === 2 ? this.les_point_image : this.les_beached_image,
                                    show: appearance.get('on'),
                                })
                            );
                        }
                        else {
                            this._uncertain[le_idx].show = appearance.get('on');
                            this._uncertain[le_idx].position = Cesium.Cartesian3.fromDegrees(uncertain.longitude[f],
                                                                                             uncertain.latitude[f]);

                            if (uncertain.status[f] === 3) {
                                this._uncertain[le_idx].image = this._les_beached_image;
                            }
                            else {
                                this._uncertain[le_idx].image = this._les_point_image;
                            }

                            // set the opacity of particle if the mass has changed
                            if (uncertain.mass[f] !== webgnome.model.get('spills').at(uncertain.spill_num[f])._per_le_mass) {
                                this._uncertain[le_idx].color = uncertain_LE_color.withAlpha(
                                    uncertain.mass[f] / webgnome.model.get('spills').at(uncertain.spill_num[f])._per_le_mass
                                );
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
                        this._certain.push(this.les.add({
                            position: Cesium.Cartesian3.fromDegrees(certain.longitude[f], certain.latitude[f]),
                            // color: certain_LE_color.withAlpha(
                            //     certain.mass[f] / webgnome.model.get('spills').at(certain.spill_num[f])._per_le_mass
                            // ),
                            eyeOffset : new Cesium.Cartesian3(0,0,-2),
                            image: certain.status[f] === 2 ? this.les_point_image : this.les_beached_image,
                                    show: appearance.get('on'),
                        }));
                    }
                    else {
                        // update the point position and graphical representation
                        this._certain[le_idx].show = appearance.get('on');
                        this._certain[le_idx].position = Cesium.Cartesian3.fromDegrees(certain.longitude[f],
                                                                                       certain.latitude[f]);

                        if (certain.status[f] === 3) {
                            this._certain[le_idx].image = this._les_beached_image;
                        }
                        else {
                            this._certain[le_idx].image = this._les_point_image;
                        }

                        // set the opacity of particle if the mass has changed
                        if (certain.mass[f] !== webgnome.model.get('spills').at(certain.spill_num[f])._per_le_mass) {
                            // this._certain[le_idx].color = certain_LE_color.withAlpha(
                            //     certain.mass[f] / webgnome.model.get('spills').at(certain.spill_num[f])._per_le_mass
                            // );
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
        },

        updateVis: function(options) {
            // Updates the appearance of this model's graphics object.
            // Implementation varies depending on the specific object type.
            if (options) {
                if (options.id === 'les') {
                    var bbs = this.les._billboards;
                    var appearance = this.get('_appearance').findWhere({id:'les'});
                    var changedAttrs, newColor, i;

                    changedAttrs = appearance.changedAttributes();
                    if (changedAttrs) {
                        if (changedAttrs.certain_LE_color) {
                            newColor = Cesium.Color.fromCssColorString(appearance.get('certain_LE_color'));

                            for (i = 0; i < this._certain.length; i++) {
                                this._certain[i].color.blue = newColor.blue;
                                this._certain[i].color.red = newColor.red;
                                this._certain[i].color.green = newColor.green;
                            }
                        }

                        if (changedAttrs.uncertain_LE_color) {
                            newColor = Cesium.Color.fromCssColorString(appearance.get('uncertain_LE_color'));

                            for (i = 0; i < this._uncertain.length; i++) {
                                this._uncertain[i].color.blue = newColor.blue;
                                this._uncertain[i].color.red = newColor.red;
                                this._uncertain[i].color.green = newColor.green;
                            }
                        }

                        for(i = 0; i < bbs.length; i++) {
                            bbs[i].scale = appearance.get('scale');
                            bbs[i].show = appearance.get('on');
                        }
                    }
                }
                else {
                    var visObj = this._locVis;

                    if (options.changedAttributes()) {
                        visObj.show = options.get('on');
                    }
                }
            }
        },
    });

    return gnomeSpill;
});
