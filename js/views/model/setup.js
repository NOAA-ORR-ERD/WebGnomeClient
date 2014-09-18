define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/model/setup.html',
    'model/gnome',
    'model/environment/wind',
    'views/form/wind',
    'text!templates/panel/wind.html',
    'model/map',
    'views/form/map',
    'text!templates/panel/map.html',
    'model/environment/water',
    'views/form/water',
    'model/spill',
    'views/form/spill/type',
    'views/form/location',
    'jqueryDatetimepicker',
    'flot',
    'flottime',
    'flotresize',
    'flotdirection'
], function($, _, Backbone, moment, AdiosSetupTemplate, GnomeModel,
    WindModel, WindForm, WindPanelTemplate,
    MapModel, MapForm, MapPanelTemplate,
    WaterModel, WaterForm,
    SpillModel, SpillTypeForm,
    LocationForm){
    var adiosSetupView = Backbone.View.extend({
        className: 'page setup',

        events: {
            'click .icon': 'selectPrediction',
            'click .wind': 'clickWind',
            'click .water': 'clickWater',
            'click .spill': 'clickSpill',
            'click .map': 'clickMap',
            'click .location': 'clickLocation',
            'blur input': 'updateModel',
            'click .eval': 'evalModel'
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
            var compiled = _.template(AdiosSetupTemplate, {
                start_time: moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm'),
                duration: webgnome.model.formatDuration(),
            });

            $('body').append(this.$el.append(compiled));

            setTimeout(_.bind(function(){
                var pred = localStorage.getItem('prediction');
                if(pred){
                    this.$('.' + pred).click();
                } else {
                    this.$('.fate').click();
                }
            }, this), 1);

            this.updateObjects();

            this.$('.date').datetimepicker({
                format: 'Y/n/j G:i'
            });
        },

        evalModel: function(e){
            e.preventDefault();
            webgnome.router.navigate('model', true);
        },

        updateModel: function(){
            var start_time = moment(this.$('#start_time').val(), 'YYYY/M/D H:mm').format('YYYY-MM-DDTHH:mm:ss');
            webgnome.model.set('start_time', start_time);

            var days = this.$('#days').val();
            var hours = this.$('#hours').val();
            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            webgnome.model.set('duration', duration);

            webgnome.model.save();
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

            localStorage.setItem('prediction', target);

            if (target == 'fate') {
                this.showFateObjects();
            } else if (target == 'trajectory') {
                this.showTrajectoryObjects();
            } else{
                this.showAllObjects();
            }
        },

        showFateObjects: function(){
            this.$('.model-objects > div').css('opacity', 0).css('visibility', 'hidden');
            this.$('.model-objects > div:first').css('opacity', 1).css('visibility', 'visible');
            this.$('.wind').css('opacity', 1).css('visibility', 'visible');
            this.$('.water').css('opacity', 1).css('visibility', 'visible');
            this.$('.spill').css('opacity', 1).css('visibility', 'visible');
        },

        showAllObjects: function(){
            this.$('.model-objects > div').css('opacity', 1).css('visibility', 'visible');
            this.$('.pannel').css('opacity', 1).css('visibility', 'visible');
        },

        showTrajectoryObjects: function(){

        },

        updateObjects: function(){
            this.updateWind();
        },

        clickWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            if(_.isUndefined(wind) || wind.length === 0){
                wind = new WindModel();
            }

            var windForm = new WindForm(null, wind);
            windForm.on('hidden', windForm.close);
            windForm.on('save', function(){
                webgnome.model.get('environment').add(wind);
                webgnome.model.save();
            });
            windForm.render();
        },

        updateWind: function(){
            var wind = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.wind.Wind'});
            this.$('.panel-body').html();
            if(!_.isUndefined(wind)){
                var compiled;
                this.$('.wind .state').addClass('complete');
                if(wind.get('timeseries').length == 1){
                    compiled = _.template(WindPanelTemplate, {
                        speed: wind.get('timeseries')[0][1][0],
                        direction: wind.get('timeseries')[0][1][1],
                        units: wind.get('units')
                    });
                    this.$('.wind').removeClass('col-md-6').addClass('col-md-3');
                } else {
                    compiled = '<div class="axisLabel yaxisLabel">' + wind.get('units') + '</div><div class="chart"></div>';
                    var ts = wind.get('timeseries');
                    var data = [];

                    for (var entry in ts){
                        var date = moment(ts[entry][0], 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                        data.push([parseInt(date, 10), parseInt(ts[entry][1][0], 10), parseInt(ts[entry][1][1], 10) - 180]);
                    }

                    var dataset = [{
                        data: data,
                        color: 'rgba(151,187,205,1)',
                        hoverable: true,
                        shadowSize: 0,
                        lines: {
                            show: false,
                            lineWidth: 2
                        },
                        direction: {
                            show: true,
                            openAngle: 40,
                            color: '#7a7a7a',
                            fillColor: '#7a7a7a',
                            arrawLength: 5
                        }
                    }];

                    this.$('.wind').removeClass('col-md-3').addClass('col-md-6');
                }
                this.$('.wind .panel-body').html(compiled);
                this.$('.wind .panel-body').show();

                if(!_.isUndefined(dataset)){
                    // set a time out to wait for the box to finish expanding or animating before drawing
                    this.windPlot = $.plot('.wind .chart', dataset, {
                        grid: {
                            borderWidth: 1,
                            borderColor: '#ddd'
                        },
                        xaxis:{
                            mode: 'time',
                            timezone: 'browser',
                        }
                    });
                }
            } else {
                this.$('.wind .state').removeClass('complete');
                this.$('.wind .panel-body').hide().html('');
            }
        },

        clickWater: function(){
            water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.water.Water'});
            if(_.isUndefined(water) || water.length === 0){
                water = new WaterModel();
            }
            var waterForm = new WaterForm(null, water);
            waterForm.on('hidden', waterForm.close);
            waterForm.on('hidden', function(){webgnome.model.trigger('sync');});
            waterForm.on('save', function(){
                webgnome.model.get('environment').add(water);
                webgnome.model.save();
            });
            waterForm.render();
        },

        clickSpill: function(){
            var spillTypeForm = new SpillTypeForm();
            spillTypeForm.on('hidden', spillTypeForm.close);
            spillTypeForm.render();
        },

        clickLocation: function(){
            var locationForm = new LocationForm();
            locationForm.on('hidden', locationForm.close);
            locationForm.render();
        },

        close: function(){
            $('.xdsoft_datetimepicker').remove();
            if(!_.isUndefined(this.windPlot)){
                this.windPlot.shutdown();
            }
            webgnome.model.off('sync', this.updateObjects, this);
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});