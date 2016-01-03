define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/adios.html',
    'views/form/oil/library',
    'model/element'
], function($, _, Backbone, AdiosTemplate, OilLibraryView, ElementType){
    'use strict';
    var adiosView = Backbone.View.extend({
        className: 'page adios',

        events: {
            'click .substance': 'clickSubstance'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var substance = false;
            var spills = webgnome.model.get('spills').length === 0;
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            var compiled = _.template(AdiosTemplate, {
                substance: substance,
                spills: spills,
                wind: wind, 
                water: water
            });
            $('body').append(this.$el.append(compiled));
        },

        clickSubstance: function(){
            var spills = webgnome.model.get('spills');
            var element_type;
            if(spills.length > 0){
                element_type = webgnome.model.get('spills').at(0).get('element_type');
            } else {
                element_type = new ElementType();
            }
            var oilLib = new OilLibraryView({}, element_type);
            oilLib.on('save wizardclose', _.bind(function(){
                console.log(element_type);
                webgnome.model.save();
                oilLib.on('hidden', oilLib.close);
            }, this));
            oilLib.render();
        },

    });

    return adiosView;
});