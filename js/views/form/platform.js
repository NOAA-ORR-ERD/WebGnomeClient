define([
    'underscore',
    'jquery',
    'backbone',
    'views/form/base',
    'text!templates/form/response/platform.html',
    'text!templates/form/response/platform_type.html',
    'text!templates/form/response/platform_vehicle.html',
    'json!model/platforms.json'
], function(_, $, Backbone, FormBase, 
    PlatformTemplate, PlatformTypeTemplate, PlatformVehicleTemplate,
    platforms){
    var platformView = FormBase.extend({
        className: 'panel panel-default complete',

        events: function(){
            return _.defaults({
                'click .type': 'pickType',
                'click .reset': 'reset',
                'change .existing-platform': 'pickExisting'
            }, FormBase.prototype.events);            
        },

        initialize: function(options){
            FormBase.prototype.initialize.call(this, options);
            this.render();
        },

        render: function(){
            FormBase.prototype.render.call(this);
            this.$el.html(_.template(PlatformTemplate)({platform: this.model.attributes}));

            var compiled = '';
            var type = this.model.get('type');
            if(type === ''){
                compiled = _.template(PlatformTypeTemplate)({
                    platforms: this.getPlatformOptions(platforms)
                });
            } else {
                compiled = _.template(PlatformVehicleTemplate)(this.model.attributes);
            }

            this.$('.panel-body').append(compiled);
        },

        pickType: function(e){
            this.model.set('type', this.$(e.target).data('type'));
            this.model.configureType();
            this.render();
        },

        pickExisting: function(e){
            this.model.set('name', this.$(e.target).val());
            this.model.getPlatformByName();
            this.render();
        },

        getPlatformOptions: function(){
            var options = '<option>Select Existing Platform</option>';
            var keys = _.keys(platforms);
            for(var g = 0; g < keys.length; g++){
                var group = '<optgroup label="' + keys[g] + '">';
                for(var p = 0; p < platforms[keys[g]].length; p++){
                    group += '<option>' + platforms[keys[g]][p].name + '</option>';
                }
                group += '</optgroup>';

                options += group;
            }

            return options;
        },

        renderAttributes: function(){},

        reset: function(){
            this.model.clear({silent: true});
            this.model.set('type', '');
            this.render();
        }
    });

    return platformView;
});