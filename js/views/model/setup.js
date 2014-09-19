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
    'model/spill',
    'views/form/spill/type',
    'jqueryDatetimepicker',
    'flot',
    'flottime',
    'flotresize',
    'flotdirection',
    'flottooltip'
], function($, _, Backbone, moment, AdiosSetupTemplate, GnomeModel,
    WindModel, WindForm, WindPanelTemplate,
    MapModel, MapForm, MapPanelTemplate,
    SpillModel, SpillTypeForm){
    var adiosSetupView = Backbone.View.extend({
        className: 'page setup',

        events: {
            'click .icon': 'selectPrediction',
            'click .wind': 'clickWind',
            'click .water': 'clickWater',
            'click .spill': 'clickSpill',
            'click .map': 'clickMap',
            'blur input': 'updateModel',
            'click .location': 'loadLocation',
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
                duration: webgnome.model.formatDuration().days,
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

            var duration = (parseInt(this.$('#duration').val(), 10) * 24) * 60 * 60;
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
            this.updateSpill();
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

        },

        clickSpill: function(){
            var spill = webgnome.model.get('spills').findWhere({obj_type: 'gnome.spill.spill.Spill'});
            if(_.isUndefined(spill) || spill.length === 0){
                spill = new SpillModel();
            }
            var spillTypeForm = new SpillTypeForm(null, spill);
            spillTypeForm.on('hidden', spillTypeForm.close);
            spillTypeForm.on('save', function(){
                webgnome.model.get('spills').add(spill);
                webgnome.model.save();
            });
            spillTypeForm.render();
        },

        sortArray: function(a, b){
            if (a[0] > b[0]){
                return 1;
            }
            if (a[0] < b[0]){
                return -1;
            }
            return 0;
        },

        updateSpill: function(){
            var spill = webgnome.model.get('spills');
            var units = webgnome.model.get('spills').findWhere({obj_type: 'gnome.spill.spill.Spill'});
            this.$('.panel-body').html();
            if(spill.models.length !== 0){
                var compiled;
                this.$('.spill .state').addClass('complete');
                compiled = '<div class="axisLabel yaxisLabel">' + units.get('units') + '</div><div class="chart"></div>';
                var spilldata = spill.models;
                var data = [];

                for (var i = 0; i < spilldata.length; i++){
                    var date = moment(spilldata[i].attributes.release.attributes.release_time, 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                    var endTime = moment(spilldata[i].attributes.release.attributes.end_release_time, 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                    var amount = spilldata[i].attributes.amount;
                    data.push([parseInt(date, 10), parseInt(amount, 10)]);
                }

                data.sort(_.bind(this.sortArray, this));

                var dataset = [
                    {
                        data: data,
                        color: 'rgba(120,200,0,1)',
                        hoverable: true,
                        shadowSize: 0,
                        lines: {
                            show: true,
                            lineWidth: 2,
                            fill: true
                        },
                        points: {
                            show: true
                        }
                    }
                ];

                this.$('.spill').removeClass('col-md-3').addClass('col-md-6');
                this.$('.spill .panel-body').html(compiled);
                this.$('.spill .panel-body').show();

                if(!_.isUndefined(dataset)){
                    this.spillPlot = $.plot('.spill .chart', dataset, {
                        grid: {
                            borderWidth: 1,
                            borderColor: '#ddd',
                            hoverable: true
                        },
                        xaxis: {
                            mode: 'time',
                            timezone: 'browser'
                        },
                        tooltip: true,
                            tooltipOpts: {
                                content: function(label, x, y, flotItem){ return "Time: " + moment(x).calendar() + "<br>Amount: " + y ;}
                            },
                            shifts: {
                                x: -30,
                                y: -50
                            }
                    });
                }
                
            } else {
                this.$('.spill .state').removeClass('complete');
                this.$('.spill .panel-body').hide().html('');
            }
            
        },

        clickMap: function(){
            var map = webgnome.model.get('map');
            if(_.isUndefined(map)){
                wind = new MapModal();
            }

            var mapForm = new MapForm(null, map);
            mapForm.on('hidden', mapForm.close);
            mapForm.on('save', function(){
                webgnome.model.set('map', map);
                webgnome.model.save();
            });
            mapForm.render();
        },

        loadLocation: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
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