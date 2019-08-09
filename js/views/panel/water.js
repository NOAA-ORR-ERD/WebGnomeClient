define([
    'underscore',
    'jquery',
    'backbone',
    'views/panel/base',
    'model/environment/water',
    'views/form/water',
    'text!templates/panel/water.html'
], function(_, $, Backbone, BasePanel, WaterModel, WaterForm, WaterPanelTemplate){
    var waterPanel = BasePanel.extend({
        className: 'col-md-3 water object panel-view',

        models: [
            'gnome.environment.water.Water'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.rerender);
        },

        render: function(){
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.water.Water'});
            var compiled;
            if (!_.isUndefined(water)){
                compiled = _.template(WaterPanelTemplate, {
                    water: true,
                    temperature: water.get('temperature'),
                    salinity: water.get('salinity'),
                    sediment: water.get('sediment'),
                    wave_height: water.get('wave_height'),
                    fetch: water.get('fetch'),
                    units: water.get('units')
                });
                this.$el.html(compiled);
                this.$('.panel').addClass('complete');
                this.$('.panel-body').show();
            } else {
                compiled = _.template(WaterPanelTemplate, {
                    water: false
                });
                this.$el.html(compiled);
                this.$('.panel').removeClass('complete');
                this.$('.panel-body').hide().html('');
            }
            BasePanel.prototype.render.call(this);
        },

        new: function(){
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.water.Water'});
            if(_.isUndefined(water) || water.length === 0){
                water = new WaterModel();
            }
            var waterForm = new WaterForm(null, water);
            waterForm.on('hidden', waterForm.close);
            waterForm.on('save', _.bind(function(){
                webgnome.model.get('environment').add(water, {merge:true});
                webgnome.model.save(null, {validate: false});
            }, this));
            waterForm.render();
        }

    });

    return waterPanel;
});