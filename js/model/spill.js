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

        defaults: {
            'on': true,
            'obj_type': 'gnome.spill.spill.Spill',
            'release': new GnomeRelease(),
            'element_type': new GnomeElement(),
            'name': 'Spill',
            'amount': 0,
            'units': 'bbl'
        },

        model: {
            release: GnomeRelease,
            element_type: GnomeElement
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

            if (localStorage.getItem('prediction') === 'trajectory' && massUnits.indexOf(attrs.units) === -1){
                return 'Amount released must use units of mass when in trajectory only mode!';
            }

            if (localStorage.getItem('prediction') !== 'trajectory' && massUnits.indexOf(attrs.units) === -1 && _.isNull(attrs.element_type.get('substance'))){
                return 'You must either select a weathering substance or use mass units for amount!';
            }

            // if (localStorage.getItem('prediction') !== 'trajectory'){
            //     if (!attrs.element_type.isValid()){
            //         this.validationContext = 'substance';
            //         return attrs.element_type.validationError;
            //     }

            //     if (attrs.element_type.get('substance') && _.isUndefined(attrs.element_type.get('substance').get('name'))){
            //         this.validationContext = 'substance';
            //         return;
            //     }
            // }

            if (localStorage.getItem('prediction') !== 'fate'){
                if(!attrs.release.isValid()){
                    this.validationContext = 'map';
                    return attrs.release.validationError;
                }
            }
            this.validationContext = null;
        },

        validateSubstance: function(attrs){
            if (_.isUndefined(attrs)){
                attrs = this.attributes;
            }
            // if (localStorage.getItem('prediction') !== 'trajectory'){
            //     if(_.isNull(attrs.element_type.get('substance')) || _.isUndefined(attrs.element_type.get('substance').get('name'))){
            //         return 'A substance must be selected!';
            //     }
            // }
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