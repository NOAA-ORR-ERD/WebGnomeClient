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
    'views/panel/model',
    'views/panel/wind',
    'views/panel/water',
    'views/panel/weatherers',
    'views/panel/map',
    'views/panel/diffusion-h',
    'views/panel/griddedwind',
    'views/panel/current',
    'views/panel/spill',
    'views/panel/response',
    'views/panel/roc-response',
    'views/panel/beached',
    'views/default/timeline',
    'jqueryDatetimepicker'
], function($, _, Backbone, BaseView, module, moment, Masonry, AdiosSetupTemplate, FormModal, GnomeModel, GnomeForm, ModelPanel,
    WindPanel, WaterPanel, WeathererPanel, MapPanel, DiffusionPanel, CurrentPanel, GriddedWindPanel, SpillPanel, ResponsePanel, RocResponsePanel, BeachedPanel, TimelineView){
    'use strict';
    var adiosSetupView = BaseView.extend({
        className: 'page setup',
        current_extents: [],

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel()){
                if(webgnome.model.get('mode') === 'adios'){
                    webgnome.router.navigate('/adios', true);
                } else if (webgnome.model.get('mode') === 'roc'){
                    webgnome.router.navigate('/roc', true);
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
            var compiled = _.template(AdiosSetupTemplate)({
                start_time: moment(webgnome.model.get('start_time')).format(webgnome.config.date_format.moment),
                duration: webgnome.model.formatDuration(),
                name: !_.isUndefined(webgnome.model.get('name')) ? webgnome.model.get('name') : ''
            });
            this.$el.append(compiled);

            BaseView.prototype.render.call(this);

            this.children = [
                this.modelpanel = new ModelPanel(),
                this.wind = new WindPanel(),
                this.water = new WaterPanel(),
                this.weatherers = new WeathererPanel(),
                this.map = new MapPanel(),
                this.diffusion = new DiffusionPanel(),
                this.griddedwind = new GriddedWindPanel(),
                this.current = new CurrentPanel(),
                this.spill = new SpillPanel(),
                this.response = new ResponsePanel(),
                //this.roc_response = new RocResponsePanel(),
                this.beached = new BeachedPanel()
            ];

            this.$('.model-objects').append(
                this.modelpanel.$el,
                this.wind.$el,
                this.water.$el,
                this.weatherers.$el,
                this.map.$el,
                this.diffusion.$el,
                this.griddedwind.$el,
                this.current.$el,
                this.spill.$el
            );

            this.$('.response-objects').append(
                this.response.$el,
                //this.roc_response.$el,
                this.beached.$el
            );


            this.initMason();

            this.children.push(new TimelineView({el: this.$('.timeline')}));
            
            var layoutfn = _.debounce(_.bind(this.layout, this), 100);
            for(var child in this.children){
                this.children[child].render();
                this.listenTo(this.children[child], 'render', layoutfn);
            }
            this.layout();

            this.$('.icon').tooltip({
                placement: 'bottom'
            });
        },

        layout: function(){
            this.mason.layout();
        },

        showHelp: function(){
            var compiled = '<div class="gnome-help" title="Get Help on Setup View"></div>';
            this.$('h2:first').append(compiled);
            this.$('h2:first .gnome-help').tooltip();
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
