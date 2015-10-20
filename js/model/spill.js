define([
    'underscore',
    'jquery',
    'backbone',
    'model/base',
    'model/release',
    'model/element'
], function(_, $, Backbone, BaseModel, GnomeRelease, GnomeElement){
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
            this.on('change:element_type', this.addListeners, this);
        },

        addListeners: function(){
            this.get('element_type').on('change', this.elementTypeChange, this);
        },

        elementTypeChange: function(element_type){
            this.childChange('element_type', element_type);
        },

        validate: function(attrs, options){
            var massUnits = ['kg', 'ton', 'metric ton'];
            
            if ($.trim(attrs.name) === ''){
                this.validationContext = 'spill';
                return 'A spill name is required!';
            }

            if(isNaN(attrs.amount)){
                this.validationContext = 'info';
                return 'Amount must be a number';
            } else if (attrs.amount <= 0) {
                this.validationContext = 'info';
                return 'Amount must be a positive number';
            }

            if (!attrs.units) {
                this.validationContext = 'info';
                return 'You must select a unit for the spill amount!';
            }

            if (massUnits.indexOf(attrs.units) === -1 && attrs.element_type.get('substance') === null){
                this.validationContext = 'info';
                return 'Amount released must use units of mass when using non-weathering substance!';
            }

            if (massUnits.indexOf(attrs.units) === -1 && _.isNull(attrs.element_type.get('substance'))){
                return 'You must either select a weathering substance or use mass units for amount!';
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
        },

        validateSections: function(){
            var attrs = this.attributes;
            this.validateRelease(attrs);
            //this.validateSubstance(attrs);
            this.validateLocation(attrs);
        },

        validateRelease: function(attrs){
            if (_.isUndefined(attrs)){
                attrs = this.attributes;
            }
            if(isNaN(attrs.amount)){
                this.validationContext = 'info';
                return 'Amount must be a number';
            } else if (attrs.amount <= 0) {
                this.validationContext = 'info';
                return 'Amount must be a positive number';
            } else if (!attrs.units) {
                this.validationContext = 'info';
                return 'A unit for amount must be selected';
            }
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