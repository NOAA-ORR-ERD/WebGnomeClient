define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'views/form/map/goods',
    'views/form/map/upload',
    'text!templates/form/map/type.html'
], function($, _, Backbone, FormModal, GoodsMapForm, MapUploadForm, SelectTemplate){
    'use strict';
    var mapTypeForm = FormModal.extend({
        title: 'Select Map Type',
        className: 'modal fade form-modal shorelinetype-form',

        events: function(){
            return _.defaults({
                'click .waterWorld': 'waterWorld',
                'click .parameterized': 'parameterized',
                'click .realLocation': 'realLocation',
                'click .upload': 'upload'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(SelectTemplate);
            this.buttons = null;
            FormModal.prototype.render.call(this, options);
        },

        waterWorld: function(e){
            this.trigger('waterWorld');
        },

        parameterized: function(e){
            
        },

        upload: function(){
            this.trigger('select', new MapUploadForm());
        },

        realLocation: function(e){
            this.trigger('select', new GoodsMapForm());
        }

    });
    return mapTypeForm;
});