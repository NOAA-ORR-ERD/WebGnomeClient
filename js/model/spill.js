define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'model/release',
    'model/element',
    'nucos'
], function(_, $, Backbone, BaseModel, GnomeRelease, GnomeElement, nucos){
    'use strict';
    var gnomeSpill = BaseModel.extend({
        urlRoot: '/spill/',

        defaults: function(){
            return {
                'on': true,
                'obj_type': 'gnome.spill.spill.Spill',
                'release': new GnomeRelease(),
                'element_type': new GnomeElement(),
                'name': 'Spill',
                'amount': 0,
                'units': ''
            };
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
        },

        initialize: function(options) {
            BaseModel.prototype.initialize.call(this, options);
            if(webgnome.hasModel() && webgnome.model.getElementType()){
                this.set('element_type', webgnome.model.getElementType());
                if (!_.isNull(this.get('element_type').get('substance'))) {
                    this.set('units', 'bbl');
                } else {
                    this.set('units', 'kg');
                }
            } else {
                this.set('units', 'kg');
            }
            this.on('change:element_type', this.addListeners, this);
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

        addListeners: function(){
            this.get('element_type').on('change', this.elementTypeChange, this);
        },

        elementTypeChange: function(element_type){
            this.childChange('element_type', element_type);
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
            var substance = attrs.element_type.get('substance');
            var massUnits = ['kg', 'ton', 'metric ton'];
            if(_.isNull(substance) && massUnits.indexOf(attrs.units) === -1){
                return 'Amount released must use units of mass when using non-weathering substance!';
            }
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
                if(bbl < 1){
                    return 'Amount must be greater than 1 bbl when using a weatherable substance';
                }
            } else if(attrs.amount <= 0) {
                return 'Amount must be greater than 0';
            }

            if (massUnits.indexOf(attrs.units) === -1 && _.isNull(substance)){
                this.validationContext = 'info';
                return 'Amount released must use units of mass when using non-weathering substance!';
            }

            // if(nucos.convert)
        },

        validateLocation: function(attrs){
            var release = this.get('release');
            if (_.isUndefined(attrs)){
                attrs = release.attributes;
            }

            return release.validateLocation(attrs);
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
        }
    });

    return gnomeSpill;
    
});