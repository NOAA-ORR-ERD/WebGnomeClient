define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'text!templates/risk/shorelineSelect.html'
], function($, _, Backbone, FormModal, SelectTemplate){
    'use strict';
    var selectShorelineForm = FormModal.extend({
        title: 'Select Shoreline Type for Risk Assessment',
        className: 'modal fade form-modal shorelinetype-form',

        events: function(){
            return _.defaults({
                'click .waterWorld': 'waterWorld',
                'click .parameterized': 'parameterized',
                'click .realLocation': 'realLocation'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model){
            this.model = model;
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(SelectTemplate)();
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        waterWorld: function(e){

        },

        parameterized: function(e){
            
        },

        realLocation: function(e){

        }

    });
    return selectShorelineForm;
});