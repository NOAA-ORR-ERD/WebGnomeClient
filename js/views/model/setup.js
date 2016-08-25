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
    'views/default/timeline',
    'jqueryDatetimepicker'
], function($, _, Backbone, BaseView, module, moment, Masonry, AdiosSetupTemplate, FormModal, GnomeModel, GnomeForm,
    WindPanel, WaterPanel, MapPanel, DiffusionPanel, CurrentPanel, SpillPanel, ResponsePanel, BeachedPanel, TimelineView){
    'use strict';
    var adiosSetupView = BaseView.extend({
        className: 'page setup',
        current_extents: [],

        events: function(){
            return _.defaults({
                'blur input': 'updateModel',
                'click .advanced-edit': 'clickModel'
            }, BaseView.prototype.events);
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel()){
                if(webgnome.model.get('mode') === 'adios'){
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

            this.listenTo(webgnome.model, 'change', this.addSyncListener);
        },

        addSyncListener: function(model) {
            var changed = _.keys(model.changed);
            if(changed.length > 1 || changed.indexOf('map') === -1){
                this.listenToOnce(webgnome.model, 'sync', this.rerender);
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

            this.$('.response-objects').append(this.response.$el);

            if (webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap') {
                this.$('.response-objects').append(this.beached.$el);
            }

            this.initMason();

            this.children.push(new TimelineView({el: this.$('.timeline')}));
            
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

        rerender: function() {
            for(var child in this.children){
                this.children[child].close();
            }

            this.$el.html('');
            this.render();
        },

        layout: function(){
            this.mason.layout();
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
                for(var child in this.children){
                    this.children[child].close();
                }
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
