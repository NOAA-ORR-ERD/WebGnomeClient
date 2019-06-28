define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'module',
    'text!templates/model/trajectory/controls.html',
    'moment',
    'mousetrap',
    'views/form/outputter/netcdf',
    'views/form/outputter/kmz',
    'views/form/outputter/shape',
], function ($, _, Backbone, BaseView, module, ControlsTemplate, moment, Mousetrap, NetCDFForm, KMZForm, ShapeForm) {
    "use strict";
    var controlsView = BaseView.extend({
        events: {
            'click .play': 'play',
            'click .record': 'record',
            'click .stoprecord': 'stoprecord',
            'click .pause': 'pause',
            'click .stop': 'stop',
            'click .back': 'prev',
            'click .next': 'next',
            'click .rewind': 'rewind',
            'slide .seek > div': 'seek',
            'slidechange .seek > div': 'loop',
            'slidestop .seek > div': 'blur',
            //export menu
            'click .netcdf': 'netcdf',
            'click .kmz': 'kmz',
            'click .shape': 'shape',
        },
        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel() && this.modelMode !== 'adios'){
                this.modelListeners();
            }
            this.state = 'pause';
            this.render();
        },
        createTooltipObject: function(title) {
            return {
                "title": title,
                "container": "body",
                "placement": "bottom"
            };
        },

        modelListeners: function() {
            this.listenTo(webgnome.cache, 'rewind', this.rewind);
            this.listenTo(webgnome.cache, 'step:buffered', this.updateProgress);
            this.listenTo(webgnome.cache, 'step:failed', this.stop);
            //this.listenTo(webgnome.cache, 'step:done', this.stop);
        },

        render: function(){
            var date;
            if(webgnome.hasModel()){
                date = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:mm');
            } else {
                date = moment().format('M/DD/YYYY HH:mm');
            }
            // only compile the template if the map isn't drawn yet
            // or if there is a redraw request because of the map object changing

            var model_spills = webgnome.model.get('spills');

            var currents = webgnome.model.get('movers').filter(function(mover){
                return [
                    'gnome.movers.current_movers.CatsMover',
                    'gnome.movers.current_movers.GridCurrentMover',
                    'gnome.movers.py_current_movers.PyCurrentMover',
                    'gnome.movers.current_movers.ComponentMover',
                    'gnome.movers.current_movers.CurrentCycleMover',
                    'gnome.movers.py_wind_movers.PyWindMover'
                ].indexOf(mover.get('obj_type')) !== -1;
            });
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});
            var active_currents = [];
            if(current_outputter.get('on')){
                current_outputter.get('current_movers').forEach(function(mover){
                    active_currents.push(mover.get('id'));
                });
            }
            this.checked_currents = active_currents;

            var ice = webgnome.model.get('movers').filter(function(mover){
                return mover.get('obj_type') === 'gnome.movers.current_movers.IceMover';
            });
            var ice_tc_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.IceJsonOutput'});
            var tc_ice = [];
            ice_tc_outputter.get('ice_movers').forEach(function(mover){
                tc_ice.push(mover.get('id'));
            });
            this.tc_ice = tc_ice;

            var env_objs = webgnome.model.get('environment').filter(function(obj) {
                var ot = obj.get('obj_type').split('.');
                ot.pop();
                return ot.join('.') === 'gnome.environment.environment_objects';
            });
            var active_env_objs = [];
            env_objs.forEach(function(obj){
                active_env_objs.push(obj.get('id'));
            });
            this.active_env_objs = active_env_objs;

            this.$el.html(_.template(ControlsTemplate, {
                date: date,
                model_spills: model_spills,
                currents: currents,
                active_currents: active_currents,
                ice: ice,
                tc_ice: tc_ice,
                env_objs: env_objs,
                active_env_objs: active_env_objs,
            }));

            this.controls = {
                'record': this.$('.controls .record'),
                'recordcontrols': this.$('.controls .recordcontrols'),
                'stoprecord': this.$('.controls .stoprecord'),
                'play': this.$('.controls .play'),
                'pause': this.$('.controls .pause'),
                'seek': this.$('.seek > div:first'),
                'back': this.$('.controls .back'),
                'forward': this.$('.controls .next'),
                'fastforward' : this.$('.controls .fastfoward'),
                'rewind': this.$('.controls .rewind'),
                'progress': this.$('.controls .progress-bar'),
                'date': this.$('.controls .position')
            };

            this.controls.stoprecord.hide();
            this.controls.pause.hide();

            this.contextualize();

            this.setupControlTooltips();
        },

        contextualize: function(){
            var start_time = moment(webgnome.model.get('start_time')).format('MM/DD/YYYY HH:mm');
            this.controls.seek.slider({
                create: _.bind(function(){
                    this.$('.ui-slider-handle').html('<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + start_time + '</div></div>');
                }, this)
            });
            this.enableUI();
            // set the slider to the correct number of steps
            this.controls.seek.slider('option', 'max', webgnome.model.get('num_time_steps') - 1);
        },

        enableUI: function(){
            // visusally enable the interface and add listeners
            this.controls.seek.slider('option', 'disabled', false);
            this.$('.buttons a').removeClass('disabled');
            Mousetrap.bind('space', _.bind(this.togglePlay, this));
            Mousetrap.bind('right', _.bind(this.next, this));
            Mousetrap.bind('left', _.bind(this.prev, this));
        },

        disableUI: function(){
            // visually disable the interface and remove listeners
            this.controls.seek.slider('option', 'disabled', true);
            this.$('.buttons a').addClass('disabled');
            Mousetrap.unbind('space');
            Mousetrap.unbind('right');
            Mousetrap.unbind('left');
        },


        setupControlTooltips: function() {
            this.controls.record.tooltip(this.createTooltipObject("Record"));
            this.controls.stoprecord.tooltip(this.createTooltipObject("End Recording"));
            this.controls.recordcontrols.tooltip(this.createTooltipObject("Recording Settings"));
            this.controls.play.tooltip(this.createTooltipObject("Play"));
            this.controls.pause.tooltip(this.createTooltipObject("Pause"));
            this.controls.rewind.tooltip(this.createTooltipObject("Rewind"));
            this.controls.back.tooltip(this.createTooltipObject("Step Back"));
            this.controls.forward.tooltip(this.createTooltipObject("Step Forward"));
        },

        pause: function(e){
            if($('.modal:visible').length === 0){
                this.controls.play.show();
                this.controls.pause.hide();
                if(e){
                    this.trigger('pause');
                }
                this.state = 'pause';
            }
        },

        play: function() {
            if($('.modal:visible').length === 0){
                this.controls.pause.show();
                this.controls.play.hide();
                this.trigger('play');
                this.state = 'play';
            }
        },

        togglePlay: function(e){
            e.preventDefault();
            if (this.state === 'play') {
                this.pause(e);
            } else {
                this.play();
            }
        },

        record: function() {
            this.controls.pause.show();
            this.controls.play.hide();
            this.controls.stoprecord.show();
            this.controls.record.hide();
            this.controls.recordcontrols.prop('disabled', true);
            this.trigger('record');
            this.state = 'play';
        },

        stoprecord: function() {
            if($('.modal:visible').length === 0){
                this.pause();
                this.is_recording = false;
                this.controls.record.show();
                this.controls.stoprecord.hide();
                this.controls.recordcontrols.prop('disabled', false);
                this.controls.record.removeClass('record');
                this.controls.record.addClass('processingrecording');
                this.controls.record.prop('disabled', true);
                this.trigger('stoprecord');
                this.listenToOnce(this, 'recording_saved', _.bind(function() {
                    this.controls.record.addClass('record');
                    this.controls.record.removeClass('processingrecording');
                    this.controls.record.prop('disabled', false);
                }, this));
            }
        },

        stop: function(e) {
            if($('.modal:visible').length === 0){
                this.pause(e);
                if(e){
                    this.trigger('stop');
                }
            }
        },

        rewind: function(e){
            if(webgnome.cache.length === 0 && !webgnome.cache.isDead) {
                e = false;
            }
            this.stop(e);
            this.controls.progress.css('width', 0);
            this.controls.seek.slider('value', 0);
            if(e) {
                this.trigger('rewind');
            }
        },

        prev: function(){
            this.pause();
            this.controls.seek.slider('value', this.controls.seek.slider('value') - 1);
            this.trigger('loop', {step: this.controls.seek.slider('value')});
        },

        next: function(){
            //if($('.modal').length === 0){
            this.pause();
            if(this.controls.seek.slider('value') <= webgnome.cache.length){
                this.controls.seek.slider('value', this.controls.seek.slider('value') + 1);
            }
            this.trigger('loop', {step: this.controls.seek.slider('value')});
            //}
        },

        seek: function(e, ui){
            this.pause(e);
            this.controls.seek.slider('value', ui.value);

            if(ui.value <= webgnome.cache.length){
                this.trigger('loop', {step: ui.value});
            } else {
                this.controls.seek.one('slidestop', _.bind(this.resetSeek, this));
            }
        },

        loop: function(e) {
            if (this.getSliderValue() !== 0 && this.state === 'play'){
                this.trigger('loop', {step: this.getSliderValue()});
            }
            if (this.getSliderValue() === webgnome.model.get('num_time_steps') -1) {
                this.pause(e);
            }
        },

        resetSeek: function(){
            this.controls.seek.slider('value', webgnome.cache.length);
            this.state = 'pause';
        },

        blur: function(e, ui){
            ui.handle.blur();
        },

        show: function(e, ui) {
            BaseView.prototype.show.call(this, e, ui);
            this.contextualize();
        },

        updateProgress: _.throttle(function(){
            this.controls.progress.addClass('progress-bar-stripes active');
            var percent = Math.round(((webgnome.cache.length) / (webgnome.model.get('num_time_steps') - 1)) * 100);
            this.controls.progress.css('width', percent + '%');
        }, 20),

        getSliderValue: function() {
            return this.controls.seek.slider('value');
        },
        
                
        netcdf: function(event) {
            event.preventDefault();
            var netCDFForm = new NetCDFForm();

            netCDFForm.on('wizardclose', netCDFForm.close);
            netCDFForm.on('save', _.bind(function(model){
                netCDFForm.close();
            }, this));

            netCDFForm.render();
        },

        kmz: function(event) {
            event.preventDefault();
            var kmzForm = new KMZForm();
            
            kmzForm.on('wizardclose', kmzForm.close);
            kmzForm.on('save', _.bind(function(model){
                kmzForm.close();
            }, this));

            kmzForm.render();
        },

        shape: function(event) {
            event.preventDefault();
            var shapeForm = new ShapeForm();

            shapeForm.on('wizardclose', shapeForm.close);
            shapeForm.on('save', _.bind(function(model){
                shapeForm.close();
            }, this));

            shapeForm.render();
        },

    });
    return controlsView;
});