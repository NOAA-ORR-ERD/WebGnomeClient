define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'views/form/map/goods',
    'views/form/map/upload',
    'views/form/map/param',
    'model/map/map',
    'text!templates/form/map/type.html'
], function($, _, Backbone, module, FormModal, GoodsMapForm, MapUploadForm,
    ParamMapForm, MapModel, SelectTemplate){
    'use strict';
    var mapTypeForm = FormModal.extend({
        title: 'Select Map Type',
        className: 'modal form-modal model-form shorelinetype-form',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function(){
            return _.defaults({
                'click .waterWorld': 'waterWorld',
                'click .parameterized': 'parameterized',
                'click .customLocation': 'customLocation',
                'click .upload': 'upload'
            }, FormModal.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options){
            this.body = _.template(SelectTemplate)();
            FormModal.prototype.render.call(this, options);
        },

        waterWorld: function(e){
            webgnome.model.set('map', new MapModel());
            webgnome.model.save({success: this.hide});
        },

        parameterized: function(e){
            var pmapForm = new ParamMapForm();
            pmapForm.render();
            this.hide();
        },

        upload: function(){
            var uForm = new MapUploadForm();
            uForm.render();
            this.hide();
        },

        customLocation: function(e){
            var customForm = new GoodsMapForm({size: 'xl'});
            customForm.render();
            this.hide();
        }

    });
    return mapTypeForm;
});