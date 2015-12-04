define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form',
    'views/form/map/goods',
    'views/form/map/upload',
    'views/form/map/param',
    'text!templates/form/map/type.html'
], function($, _, Backbone, FormModal, GoodsMapForm, MapUploadForm, ParamMapForm, SelectTemplate){
    'use strict';
    var mapTypeForm = FormModal.extend({
        title: 'Select Map Type',
        className: 'modal form-modal shorelinetype-form',

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
            this.trigger('select', new ParamMapForm());
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