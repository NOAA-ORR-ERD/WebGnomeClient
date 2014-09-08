define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/model/adiosSetup.html',
    'model/gnome',
    'model/environment/wind',
    'views/form/wind',
    'text!templates/panel/wind.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, AdiosSetupTemplate, GnomeModel,
    WindModel, WindForm, WindPanelTemplate){
    var adiosSetupView = Backbone.View.extend({
        className: 'page adios setup',

        events: {
            'click .fate': 'selectPrediction',
            'click .wind': 'clickWind',
            'click .water': 'clickWater',
            'click .spill': 'clickSpill',
            'click .map': 'clickMap'
        },

        initialize: function(){
            if(webgnome.hasModel()){
                webgnome.model.on('sync', this.updateObjects, this);
                this.render();
            } else {
                webgnome.model = new GnomeModel();
                webgnome.model.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        webgnome.model.on('sync', this.updateObjects, this);
                        this.render();
                    }, this)
                });
            }
        },

        render: function(){
            var compiled = _.template(AdiosSetupTemplate);

            $('body').append(this.$el.append(compiled));

            setTimeout(_.bind(function(){
                this.$('.fate').click();
            }, this), 1);

            this.$('.date').datetimepicker({
                format: 'Y/n/j G:i'
            });
        },

        selectPrediction: function(e){
            var target;
            this.$('.icon').removeClass('selected');
            if(this.$(e.target).hasClass('icon')){
                this.$(e.target).addClass('selected');
                target = this.$(e.target).attr('class').replace('icon', '').replace('selected', '').trim();
            } else {
                this.$(e.target).parent().addClass('selected');
                target = this.$(e.target).parent().attr('class').replace('icon', '').replace('selected', '').trim();
            }

            if (target == 'fate') {
                this.showFateObjects();
            } else {
                this.showFatePlusObjects();
            }
        },

        showFateObjects: function(){
            this.$('.model-objects > div').css('opacity', 1).css('visibility', 'visible');
            this.$('.wind').css('opacity', 1).css('visibility', 'visible');
            this.$('.water').css('opacity', 1).css('visibility', 'visible');
            this.$('.spill').css('opacity', 1).css('visibility', 'visible');
            this.$('.map').css('opacity', 0).css('visibility', 'hidden');
        },

        showFatePlusObjects: function(){
            this.$('.model-objects > div').css('opacity', 1).css('visibility', 'visible');
            this.$('.wind').css('opacity', 1).css('visibility', 'visible');
            this.$('.water').css('opacity', 1).css('visibility', 'visible');
            this.$('.spill').css('opacity', 1).css('visibility', 'visible');
            this.$('.map').css('opacity', 1).css('visibility', 'visible');
        },

        updateObjects: function(){
            this.updateWind();
        },

        clickWind: function(){
            wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(_.isUndefined(wind) || wind.length === 0){
                wind = new WindModel();
            }

            var windForm = new WindForm(null, wind);
            windForm.on('hidden', windForm.close);
            windForm.on('hidden', function(){webgnome.model.trigger('sync');});
            windForm.on('save', function(){
                webgnome.model.get('environment').add(wind);
                webgnome.model.save();
            });
            windForm.render();
        },

        updateWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(!_.isUndefined(wind)){
                this.$('.wind .state').addClass('complete');
                var compiled = _.template(WindPanelTemplate, {
                    speed: wind.get('timeseries')[0][1][0],
                    direction: wind.get('timeseries')[0][1][1],
                    units: wind.get('units')
                });
                this.$('.wind .panel-body').html(compiled);
                this.$('.wind .panel-body').show();
            } else {
                this.$('.wind .state').removeClass('complete');
                this.$('.wind .panel-body').hide().html('');
            }
        },

        clickWater: function(){

        },

        clickSpill: function(){

        },

        clickMap: function(){

        },

        close: function(){
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});