define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/modal/form',
    'text!templates/form/weatherers.html'
], function($, _, Backbone, module, FormModal, WeatherersFormTemplate){
    'use strict';
    var weatherersForm = FormModal.extend({
        title: 'Weatherers',

		events: function() {
            return _.defaults({}, FormModal.prototype.events);
        },

        initialize: function(options, gnomeModel) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            if (!_.isUndefined(gnomeModel)){
                this.model = gnomeModel;
            } else {
                this.model = webgnome.model;
            }
        },

        render: function(options) {
            this.body = _.template(WeatherersFormTemplate)({model:this.model});
            FormModal.prototype.render.call(this, options);
        },

        update: function(e) {
            var name = e.currentTarget.name;
            var val;
            if (e.currentTarget.type === "checkbox") {
                val = e.currentTarget.checked;
            } else {
                val = this.$(e.currentTarget).val();
            }
            this.model.set(name, val);
        }
    });

    return weatherersForm;
});