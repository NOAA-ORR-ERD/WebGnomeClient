define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'moment',
    'masonry',
    'text!templates/model/setup.html',
    'views/modal/form',
    'model/gnome',
    'views/form/model',
    'views/panel/wind',
    'views/panel/water',
    'views/panel/map',
    'views/panel/diffusion-h',
    'views/panel/current',
    'views/panel/spill',
    'views/panel/response',
    'views/panel/beached',
    'jqueryDatetimepicker',
    'flot',
    'flottime',
    'flotresize',
    'flotextents',
    'flotnavigate',
    'jqueryui/sortable'
], function($, _, Backbone, BaseView, module, moment, Masonry, AdiosSetupTemplate, FormModal, GnomeModel, GnomeForm,
    WindPanel, WaterPanel, MapPanel, DiffusionPanel, CurrentPanel, SpillPanel, ResponsePanel, BeachedPanel){
    'use strict';
    var adiosSetupView = BaseView.extend({
        className: 'page setup',
        current_extents: [],

        events: function(){
            return _.defaults({
                'click .response .add': 'clickResponse',
                'click .response .single .edit': 'loadResponse',
                'click .response .single': 'loadResponse',
                'click .response .single .trash': 'deleteResponse',
                'mouseover .response .single': 'hoverResponse',
                'mouseout .response .response-list': 'unhoverResponse',
                'blur input': 'updateModel',
                'click .eval': 'evalModel',
                'click .rewind': 'rewindClick',
                'click .beached .add': 'clickBeached',
                'click .advanced-edit': 'clickModel'
            }, BaseView.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel()){
                if(webgnome.model.get('name') === 'ADIOS Model_'){
                    webgnome.router.navigate('/adios', true);
                } else {
                    $('body').append(this.$el);
                    this.render();
                }
            } else {
                if(_.has(webgnome, 'cache')){
                    webgnome.cache.rewind();
                }
                webgnome.model = new GnomeModel();
                $('body').append(this.$el);
                webgnome.model.save(null, {
                    validate: false,
                    success: _.bind(function(){
                        this.render();
                    }, this)
                });
            }
        },

        render: function(){
            var compiled = _.template(AdiosSetupTemplate, {
                start_time: moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: webgnome.model.formatDuration(),
                name: !_.isUndefined(webgnome.model.get('name')) ? webgnome.model.get('name') : ''
            });
            this.$el.append(compiled);

            BaseView.prototype.render.call(this);

            this.children = [
                this.wind = new WindPanel(),
                this.water = new WaterPanel(),
                this.map = new MapPanel(),
                this.diffusion = new DiffusionPanel(),
                this.current = new CurrentPanel(),
                this.spill = new SpillPanel(),
                this.response = new ResponsePanel(),
                this.beached = new BeachedPanel()
            ];

            this.$('.model-objects').append(
                this.wind.$el,
                this.water.$el,
                this.map.$el,
                this.diffusion.$el,
                this.current.$el,
                this.spill.$el
            );

            this.$('.response-objects').append(
                this.response.$el,
                this.beached.$el
            );

            this.initMason();

            var layoutfn = _.debounce(_.bind(this.layout, this), 100);
            for(var child in this.children){
                this.listenTo(this.children[child], 'render', layoutfn);
                this.children[child].render();
            }

            this.$('.icon').tooltip({
                placement: 'bottom'
            });
            this.$('.datetime').datetimepicker({
                format: webgnome.config.date_format.datetimepicker,
                allowTimes: webgnome.config.date_format.half_hour_times,
                step: webgnome.config.date_format.time_step
            });
            this.$('#datepick').on('click', _.bind(function(){
                this.$('.datetime').datetimepicker('show');
            }, this));
            this.renderTimeline();

            var delay = {
                show: 500,
                hide: 100
            };

            this.$('.panel-heading .advanced-edit').tooltip({
                title: 'Advanced Edit',
                delay: delay,
                container: 'body'
            });
        },

        layout: function(){
            this.mason.layout();
        },

        renderTimeline: function(){
            var start = parseInt(moment(webgnome.model.get('start_time')).format('x'), 10);
            var end = parseInt(start + (webgnome.model.get('duration') * 1000), 10);
            var offset = (webgnome.model.get('duration') / 12) * 1000;
            var baseline = {label: "empty", data: [[start - offset, 0],[end + offset, 0]]};

            var timelinedata = [
                {label: 'Model', start: start, end: end},
            ];

            // spills
            webgnome.model.get('spills').forEach(function(spill){
                var start = parseInt(moment(spill.get('release').get('release_time')).format('x'));
                var end = Math.max(
                    parseInt(moment(spill.get('release').get('end_release_time')).format('x')),
                    parseInt(start + (webgnome.model.get('time_step') * 1000))
                );

                timelinedata.push({
                    label: spill.get('name'),
                    start: start,
                    end: end,
                    fillColor: '#FFE6A0'
                });
            });

            webgnome.model.get('weatherers').forEach(function(weatherer){
                if(weatherer.get('obj_type').indexOf('cleanup') !== -1){
                    var start = parseInt(moment(weatherer.get('active_start')).format('x'));
                    var end = parseInt(moment(weatherer.get('active_stop')).format('x'));

                    timelinedata.push({
                        label: weatherer.get('name'),
                        start: start,
                        end: end,
                        fillColor: '#FFA0A0'
                    });
                }
            });

            // general movers w/ bundle collection for inf
            var bundle = [];
            webgnome.model.get('movers').forEach(function(mover){
                if(mover.get('active_start') === '-inf' && mover.get('active_stop') === 'inf' && mover.get('obj_type') !== 'gnome.movers.wind_movers.WindMover'){
                    bundle.push(mover);
                } else if(mover.get('obj_type') !== 'gnome.movers.wind_movers.WindMover') {
                    var start, end;

                    if(mover.get('active_start') === "-inf"){
                        start = -Infinity;
                    } else {
                        start = parseInt(moment(mover.get('active_start')).format('x'));
                    }

                    if(mover.get('active_stop') === 'inf'){
                        end = Infinity;
                    } else {
                        end = parseInt(moment(mover.get('active_stop')).format('x'));
                    }

                    timelinedata.push({
                        label: mover.get('name'),
                        start: start,
                        end: end,
                        fillColor: '#D6A0FF'
                    });
                }
            });

            // windmovers and their winds
            var windmovers = webgnome.model.get('movers').where({obj_type: 'gnome.movers.wind_movers.WindMover'});
            for(var m = 0; m < windmovers.length; m++){
                var mover = windmovers[m];
                if(mover.get('active_start') === "-inf"){
                    start = -Infinity;
                } else {
                    start = parseInt(moment(mover.get('active_start')).format('x'));
                }

                if(mover.get('active_stop') === 'inf'){
                    end = Infinity;
                } else {
                    end = parseInt(moment(mover.get('active_stop')).format('x'));
                }

                timelinedata.push({
                    label: mover.get('name'),
                    start: start,
                    end: end,
                    fillColor: '#D6A0FF'
                });

                if(mover.get('wind')){
                    var wind = mover.get('wind');

                    if(wind.get('timeseries').length > 1){
                        start = moment(wind.get('timeseries')[0][0]).format('x');
                        end = moment(wind.get('timeseries')[wind.get('timeseries').length - 1][0]).format('x');
                    }

                    timelinedata.push({
                        label: mover.get('name') + ' - ' + wind.get('name'),
                        start: start,
                        end: end,
                        fillColor: 'rgba(214, 160, 255, 0.5)'
                    });
                }
            }

            // inf mover bundle
            var label = '';
            for(var i = 0; i < bundle.length; i++){
                label += bundle[i].get('name') + ', ';
            }

            if(bundle.length > 0){
                timelinedata.push({
                    start: -Infinity,
                    end: Infinity,
                    label: label,
                    fillColor: '#D6A0FF'
                });
            }

            // dynamically set the height of the timeline div
            var height = (timelinedata.length * 20) + 40;
            this.$('.timeline').css('height', height + 'px');

            var timeline = {extents: { show: true }, data: [], extentdata: timelinedata};

            this.timeline = $.plot('.timeline', [baseline,timeline], {
                legend: {
                    show: false
                },
                grid: {
                    borderWidth: 1,
                    borderColor: '#ddd'
                },
                xaxis: {
                    mode: 'time',
                    timezone: 'browser',
                    tickColor: '#ddd'
                },
                yaxis: {
                    show: false
                },
                pan: {
                    interactive: true
                },
                series: {
                    extents: {
                        color: 'rgba(255, 255, 255, .25)',
                        lineWidth: 10,
                        rowHeight: 20,
                        barHeight: 20,
                        rows: timelinedata.length
                    }
                }
            });
        },

        showHelp: function(){
            var compiled = '<div class="gnome-help" title="Click for help"></div>';
            this.$('h2:first').append(compiled);
            this.$('h2:first .gnome-help').tooltip();
        },

        clickModel: function(){
            var form = new GnomeForm(null, webgnome.model);
            form.on('hidden', form.close);
            form.on('save', _.bind(function(){
                this.$el.html('');
                this.render();
            }, this));
            form.render();
        },

        clickDate: function(){
            this.$('.datetime').trigger('click');
        },

        initMason: function(){
            if(this.mason){
                this.mason.destroy();
            } else {
                $(window).on('resize', _.bind(this.initMason, this));
            }

            var container = this.$('.model-objects').get(0);
            this.mason = new Masonry(container, {
                columnWidth: function(colwidth){
                    return $('.setup .col-md-6').outerWidth() / 2;
                }(),
                item: '.object',
            });
        },

        updateModel: function(){
            var name = this.$('#name').val();
            webgnome.model.set('name', name);
            var start_time = moment(this.$('.datetime').val(), webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            webgnome.model.set('start_time', start_time);

            var days = this.$('#days').val();
            var hours = this.$('#hours').val();
            var duration = (((parseInt(days, 10) * 24) + parseInt(hours, 10)) * 60) * 60;
            webgnome.model.set('duration', duration);

            webgnome.model.save(null, {
                validate: false,
            });
        },

        updateModelValues: function(e){
            var name = webgnome.model.get('name');
            var start_time = moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment);
            var durationAttrs = webgnome.model.formatDuration();

            this.$('#name').val(name);
            this.$('#start_time').val(start_time);
            this.$('#days').val(durationAttrs.days);
            this.$('#hours').val(durationAttrs.hours);
        },

        close: function(){
            $('.xdsoft_datetimepicker').remove();

            for(var child in this.children){
                this.children[child].close();
            }

            webgnome.cache.off('rewind', this.rewind, this);

            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});
