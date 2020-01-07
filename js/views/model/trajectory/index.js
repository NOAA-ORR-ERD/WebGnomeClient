define([
    'jquery',
    'underscore',
    'views/default/cesium',
    'module',
    'moment',
    'toastr',
    'text!templates/model/trajectory/controls.html',
    'cesium',
    'text!templates/model/trajectory/trajectory_no_map.html',
    'model/step',
    'mousetrap',
    'html2canvas',
    'ccapture',
    'model/map/graticule',
    'views/model/trajectory/layers',
    'views/model/trajectory/controls',
    'views/model/trajectory/right_pane',
    'views/default/legend',
    'gif',
    'gifworker',
    'whammy',
], function($, _, CesiumView, module,moment, toastr, ControlsTemplate, Cesium,
            NoTrajMapTemplate, GnomeStep, Mousetrap, html2canvas, CCapture, Graticule, LayersView,
            ControlsView, RightPaneView, LegendView, gif, gifworker, whammy){
    'use strict';
    var trajectoryView = CesiumView.extend({
        className: function() {
            var str;
            if (webgnome.model.get('mode') !== 'adios') {
                str = 'trajectory-view map ';
            } else {
                str = 'trajectory-view no-map';
            }

            return str;
        },
        events: {
            'click .view-gnome-mode': 'viewGnomeMode',
            'click .view-weathering': 'viewWeathering',
            'click .gnome-help': 'renderHelp',
        },
        id: 'map',
        spillToggle: false,
        spillCoords: [],
        state: 'loading',
        frame: 0,
        contracted: false,
        fps: 15,
        rframe: 0,

        initialize: function(options){
            CesiumView.prototype.initialize.call(this, options);
            //this.module = module;
            if (webgnome.model.get('mode') !== 'adios'){
                this.listenTo(webgnome.cache, 'rewind', this.rewind);
                this.modelMode = 'gnome';
            } else {
                this.modelMode = 'adios';
            }
            this.$el.appendTo('body');
            this.state = 'stopped';
            this._canRun = true;
            this._runattempt = 0;
            this.render();
        },

        toastTips: function() {
            toastr.info("Right-click + drag to zoom");
        },

        render: function(){
            CesiumView.prototype.render.call(this);
            if (this.modelMode !== 'adios') {
                this.renderTrajectory();
            } else {
                this.renderNoTrajectory();
            }
        },

        renderNoTrajectory: function() {
            this.$el.html(_.template(NoTrajMapTemplate));
        },

        renderTrajectory: function() {
            this.overlay = $( "<div class='overlay'></div>");
            this.controls = new ControlsView({el:this.overlay});
            this.controlsListeners();

            this.overlay.append(this.controls.$el);
            this.$el.prepend(this.overlay);
            // equivalent to $( document ).ready(func(){})
            $(_.bind(function() {
                this.renderCesiumMap();
                this.layersPanel = new LayersView();
                this.layersListeners();
                this.layersPanel.render();
                this.legend = new LegendView();
                this.rightPane = new RightPaneView([this.legend, this.layersPanel, ]);
                this.rightPane.$el.appendTo(this.$el);
            }, this));
        },

        layersListeners: function(){
            this.listenTo(this.layersPanel.layers, 'add', this.addLayer);
            this.listenTo(this.layersPanel.layers, 'remove', this.removeLayer);
            this.listenTo(this.layersPanel, 'requestRender', _.bind(function() {this.trigger('requestRender');}, this));
        },
        controlsListeners: function() {
            this.listenTo(this.controls, 'play', this.play);
            this.listenTo(this.controls, 'pause', this.pause);
            this.listenTo(this.controls, 'record', this.record);
            this.listenTo(this.controls, 'stoprecord', this.stoprecord);
            this.listenTo(this.controls, 'stop', this.stop);
            this.listenTo(this.controls, 'back', this.prev);
            this.listenTo(this.controls, 'next', this.goToStep);
            this.listenTo(this.controls, 'rewind', this.rewindClick);
            this.listenTo(this.controls, 'seek', this.goToStep);
            this.listenTo(this.controls, 'loop', this.goToStep);
        },

        mapListener: function(){
            this.listenTo(webgnome.model.get('map'), 'change', this.resetMap);
        },

        spillListeners: function(){
            this.listenTo(webgnome.model.get('spills'), 'add change remove', this.resetSpills);
        },

        viewWeathering: function() {
            webgnome.router.navigate('fate', true);
            this.hide();
        },

        createTooltipObject: function(title) {
            return {
                "title": title,
                "container": "body",
                "placement": "bottom"
            };
        },

        addLayer: function(lay) {
            if (!lay.id) {
                console.error('Layer must have id attribute');
            }
            if (lay.type === 'cesium') {
                if (lay.parentEl === 'primitive') {
                    this.layers[lay.id] = this.viewer.scene.primitives.add(lay.visObj);
                } else if (lay.parentEl === 'entity') {
                    this.layers[lay.id] = this.viewer.entities.add(lay.visObj);
                } else if (lay.parentEl === 'entityCollection') {
                    this.layers[lay.id] = lay.visObj;
                    _.each(lay.visObj, _.bind(this.viewer.entities.add, this.viewer.entities));
                } else if (lay.parentEl === 'imageryLayer') {
                    this.layers[lay.id] = this.viewer.imageryLayers.addImageryProvider(lay.visObj);
                } else if (lay.parentEl === 'dataSource') {
                    this.viewer.dataSources.add(lay.visObj);
                    this.layers[lay.id] = lay.visObj;
                } else {
                    console.error('Tried to add an entity with invalid parentEl: ', lay.parentEl);
                }
            } else {
                console.error('Tried to add an entity with invalid type: ', lay.type);
            }
            // If adding a map layer, fly to it
            if (lay.id === webgnome.model.get('map').get('id')) {
                this._flyTo = true;
                var map_id = webgnome.model.get('map').id;
                this._focusOnMap();
                this._flyTo = false;
            }
            this.trigger('requestRender');
        },

        _focusOnMap: function() {
            if (_.isUndefined(this.viewer) | webgnome.model.get('map').get('obj_type') === 'gnome.map.GnomeMap') {
                if (webgnome.model.get('spills').length > 0) {
                    webgnome.model.get('spills').at(0).getBoundingRectangle().then(_.bind(function(rect) {
                        this.viewer.scene.camera.flyTo({
                            destination: rect,
                            duration: 0.25
                        });
                    }, this));
                }
                return;
            } else {
                webgnome.model.get('map').getBoundingRectangle().then(_.bind(function(rect) {
                    this.viewer.scene.camera.flyTo({
                        destination: rect,
                        duration: 0.25
                    });
                }, this));
            }
        },

        removeLayer: function(lay) {
            if (!lay.id) {
                console.error('Layer must have id attribute');
            }
            if (lay.type === 'cesium') {
                if (lay.parentEl === 'primitive') {
                    if(this.viewer.scene.primitives.remove(this.layers[lay.id])) {
                        this.layers[lay.id] = undefined;
                    } else {
                        console.warn('Failed to remove primitive layer id: ', lay.id);
                    }
                } else if (lay.parentEl === 'entity') {
                    if(this.viewer.entities.remove(this.layers[lay.id])) {
                        this.layers[lay.id] = undefined;
                    } else {
                        console.warn('Failed to remove entity layer id: ', lay.id);
                    }
                } else if (lay.parentEl === 'entityCollection') {
                    if(_.all(_.each(this.layers[lay.id], _.bind(this.viewer.entities.remove, this.viewer.entities)))) {
                        this.layers[lay.id] = undefined;
                    } else {
                        console.warn('Failed to remove entity layer id: ', lay.id);
                    }
                } else if (lay.parentEl === 'imageryLayer') {
                    if(this.viewer.imageryLayers.remove(this.layers[lay.id])) {
                        this.layers[lay.id] = undefined;
                    } else {
                        console.warn('Failed to remove imagery layer id: ', lay.id);
                    }
                } else if (lay.parentEl === 'dataSource') {
                    if(this.viewer.dataSources.remove(this.layers[lay.id])) {
                        this.layers[lay.id] = undefined;
                    } else {
                        console.warn('Failed to remove datasource layer id: ', lay.id);
                    }
                } else {
                    console.error('Tried to remove an entity with invalid parentEl: ', lay.parentEl);
                }
            } else {
                console.error('Tried to remove an entity with invalid type: ', lay.type);
            }
            this.trigger('requestRender');
        },

        show: function() {
            this.$el.show();
            if (this.modelMode === 'adios') {
                return;
            }
            this.controls.contextualize();
            if (this._flyTo) {
                var map_id = webgnome.model.get('map').id;
                this._focusOnMap();
                this._flyTo = false;
            }
        },

        renderCesiumMap: function(){
            if(!this.layers){
                this.layers = {};
            }
            this.listenTo(this, 'requestRender', this.requestRender);
            $('.cesium-widget-credits').hide();
            this.graticuleContainer = $('.overlay');
            this.graticule = new Graticule(false, this.viewer.scene, 10, this.graticuleContainer);
            this.graticule.activate();
            this.viewer.scene.fog.enabled = false;
            this.viewer.scene.pickTranslucentDepth = true;
            this.load();
        },

        load: function(){
            this.listenTo(webgnome.cache, 'step:buffered', this.updateProgress);
            //this.listenTo(webgnome.cache, 'step:failed', _.bind(function() {clearInterval(this.rframe);}, this));
            //this.listenTo(webgnome.cache, 'step:failed', this.stop);
            //this.listenTo(webgnome.cache, 'step:done', this.stop);

            if(localStorage.getItem('autorun') === 'true'){
                localStorage.setItem('autorun', '');
                this.play();
            }
            this.toastTips();
            this.addCesiumHandlers();
        },

        addCesiumHandlers: function() {

            this._openCesiumObjectTooltips = {};
            var addNewCesiumObjectTooltip = _.bind(function(pickedObject, horizOffset, vertOffset) {
                var newEntity = this.viewer.entities.add({
                    show: true,
                    position: Cesium.Cartesian3.fromDegrees(0,0),
                    label : {
                        show : false,
                        showBackground : true,
                        font : '14px monospace',
                        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                        verticalOrigin : Cesium.VerticalOrigin.TOP,
                        pixelOffset : new Cesium.Cartesian2(horizOffset, vertOffset),
                        eyeOffset : new Cesium.Cartesian3(0,0,-5),
                    }
                });
                this._openCesiumObjectTooltips[pickedObject.id] = newEntity;
                return newEntity;
            }, this);

            //Clears open tooltips
            this.doubleClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            var doubleClickHandlerFunction = _.bind(function(movement) {
                var tts = _.values(this._openCesiumObjectTooltips);
                for (var i = 0; i < tts.length; i++) {
                    this.viewer.entities.remove(tts[i]);
                }
                this._openCesiumObjectTooltips = {};
            }, this);
            this.doubleClickHandler.setInputAction(doubleClickHandlerFunction, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            this.middleClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            var middleClickHandlerFunction = _.bind(function(click) {
                var pickedPoint = this.viewer.scene.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
                if (pickedPoint) {
                    var entity;
                    var cartographic = Cesium.Cartographic.fromCartesian(pickedPoint);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                    entity = addNewCesiumObjectTooltip({id:_.values(this._openCesiumObjectTooltips).length}, 15, 0);
                    entity.position = pickedPoint;

                    entity.label.show = true;
                    entity.label.text =
                        'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
                        '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0';
                }
                this.trigger('requestRender');
                setTimeout(_.bind(this.trigger, this), 50, 'requestRender');
            }, this);
            this.middleClickHandler.setInputAction(middleClickHandlerFunction, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);

            this.singleClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            var singleClickHandlerFunction = _.bind(function(movement) {
                var pickedObject = this.viewer.scene.pick(movement.position);
                if (pickedObject) {
                    var entity;
                    if (!_.isUndefined(pickedObject.id) && (typeof pickedObject.id === 'string' || pickedObject.id instanceof String)) {
                        if (!(pickedObject.id in this._openCesiumObjectTooltips)) {
                            if (pickedObject.id.startsWith('vector')) {
                                entity = addNewCesiumObjectTooltip(pickedObject, 15, 0);
                                entity.position = pickedObject.primitive.position.clone();
                                entity.pickedObject = pickedObject;
                                entity.label.show = true;
                                entity.label.text = new Cesium.CallbackProperty(
                                    _.bind(function(){
                                        var dir = Number(this.dir ? this.dir : 0),
                                            mag = Number(this.mag ? this.mag : 0);
                                        dir = Cesium.Math.toDegrees(Cesium.Math.zeroToTwoPi(-dir)).toFixed(2);
                                        return 'Mag: ' + ('\t' + mag.toFixed(2)).slice(-7) + ' m/s' +
                                            '\nDir: ' + ('\t' + dir).slice(-7) + '\u00B0';
                                    }, entity.pickedObject.primitive),
                                    true
                                );
                            } else if (pickedObject.id.startsWith('LE')) {
                                entity = addNewCesiumObjectTooltip(pickedObject, 2, 0);
                                entity.pickedObject = pickedObject;
                                entity.position = new Cesium.CallbackProperty(
                                    _.bind(function() {
                                        return this.position.clone();
                                    }, entity.pickedObject.primitive),
                                    true
                                );
                                entity.label.show = true;
                                entity.label.text = new Cesium.CallbackProperty(
                                    _.bind(function(primitive){
                                        var mass = Number(primitive.mass ? primitive.mass : 0).toPrecision(4);
                                        var loc = Cesium.Ellipsoid.WGS84.cartesianToCartographic(primitive.position);
                                        var surf_conc = Number(primitive.surface_concentration ? primitive.surface_concentration * 1000 : 0); //kg/m2 -> g/m2
                                        var viscosity = Number(primitive.viscosity ? primitive.viscosity * 1000000 : 0); //m2/s to cSt
                                        var density = Number(primitive.density ? primitive.density : 0);
                                            //data = Number(this.pickedObject.primitive.mag ? this.pickedObject.primitive.mag : 0),
                                        var lon = this.graticule.genDMSLabel('lon', loc.longitude);
                                        var lat = this.graticule.genDMSLabel('lat', loc.latitude);
                                        var ttstr = 'Mass: ' + ('\t' + mass).slice(-7) + ' kg';
                                        if (surf_conc !== 0) {
                                            ttstr = ttstr + '\nS_Conc: \t' + webgnome.largeNumberFormatter(surf_conc) + ' g/m^2';
                                        }
                                        if (viscosity !== 0) {
                                            ttstr = ttstr + '\nViscosity: \t' + webgnome.largeNumberFormatter(viscosity) + ' cSt';
                                        }
                                        if (density !== 0) {
                                            ttstr = ttstr + '\nDensity: \t' + webgnome.largeNumberFormatter(density) + ' kg/m^3';
                                        }
                                        ttstr = ttstr +
                                            '\nLon: ' + ('\t' + lon) +
                                            '\nLat: ' + ('\t' + lat);
                                        return ttstr;
                                    }, this, entity.pickedObject.primitive),
                                    true
                                );
                            }
                        }
                    }
                } else {
                    var tts = _.values(this._openCesiumObjectTooltips);
                    for (var i = 0; i < tts.length; i++) {
                        this.viewer.entities.remove(tts[i]);
                    }
                    this._openCesiumObjectTooltips = {};
                }
                this.trigger('requestRender');
                setTimeout(_.bind(this.trigger, this), 50, 'requestRender');
            }, this);
            this.singleClickHandler.setInputAction(singleClickHandlerFunction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },

        goToStep: function(s) {
            if (this.state === 'paused') {
                this.state = 'next';
                this.frame = s.step;
            }
            if (this._canRun) {
                this.run();
            }
        },

        getCaptureOpts: function() {
            var paramObj = {format: 'gif',
                            framerate:6,
                            verbose:true,
                            motionBlurFrames:0,
                            workersPath: 'js/lib/ccapture.js/src/'};
                $.each($('.recordmenu form').serializeArray(), function(_, kv) {
                    if (kv.name === 'framerate' || kv.name === 'skip') {
                        paramObj[kv.name] = parseInt(kv.value,10);
                    } else {
                        paramObj[kv.name] = kv.value;
                    }
            });
            paramObj.workersPath = 'js/lib/ccapture.js/src/';
            return paramObj;
        },

        getDefaultFPS: function() {
            //minimum of 5 and a maximum of 45. pick a framerate that allows a run to play over 10 seconds, bounded by min and max
            var totFrames = webgnome.model.get('num_time_steps');
            var rate = Math.round(totFrames / 10);
            rate = Math.max(5, Math.min(rate, 45));
            return rate;
        },

        run: function() {
            //meant to be called at the desired fps.
            if (this.controls.getSliderValue() < webgnome.cache.length && webgnome.cache.length !== 0){
                // the cache has the step, just render it
                    this.renderStep({step:this.controls.getSliderValue()});
            }  else  {
                if(webgnome.cache.isHalted){
                    webgnome.cache.resume();
                    this._canRun = true;
                } else if (!webgnome.cache.streaming && !webgnome.cache.preparing) {
                    if (webgnome.cache.isDead) {
                        this.pause();
                        return;
                    }
                    webgnome.cache.getSteps();
                    this._canRun = true;
                } else {
                    this.renderStep({step:this.controls.getSliderValue() -1});
                }
            }
            if(this.state === 'next' || this.frame === webgnome.model.get('num_time_steps') - 1){
                this.pause();
            }
        },

        record: function() {
            if($('.modal:visible').length === 0){
                this.state = 'playing';
                this.is_recording = true;
                this.capture_opts = this.getCaptureOpts();
                this.meta_canvas = document.createElement('canvas');
                this.meta_canvas.width = this.viewer.canvas.width;
                this.meta_canvas.height = this.viewer.canvas.height;
                this.meta_canvas_ctx = this.meta_canvas.getContext('2d', {preserveDrawingBuffer: true});
                this.capturer = new CCapture(_.clone(this.capture_opts));
                this.capturer.start();
                this.capturer.skipped = 0;
                //this.recorder.resume();
                this.rframe = setInterval(_.throttle(_.bind(this.run,this), 1000/this.getDefaultFPS()), 1000/this.getDefaultFPS());
            }
        },

        stoprecord: function() {
            if($('.modal:visible').length === 0){
                this.pause();
                this.is_recording = false;
                this.capturer.stop();
                document.body.style.cursor = 'wait';
                this.capturer.save(_.bind(function(blob){
                    this.controls.trigger('recording_saved');
                    document.body.style.cursor = 'default';
                    webgnome.invokeSaveAsDialog(blob, this.capture_opts.name+'.'+this.capture_opts.format);
                }, this));
            }
        },

        play: function(e){
            if($('.modal:visible').length === 0){
                this.state = 'playing';
                this._canRun = true;    
                this.rframe = setInterval(_.bind(
                    function(){
                        if(this._canRun || this._runattempt > 5){
                            this._canRun = false;
                            this._runattempt=0;
                            this.run();}
                        else {
                            this._runattempt++;
                        }
                    },this
                ), 1000/this.getDefaultFPS());
            }
        },

        pause: function(e){
            if($('.modal:visible').length === 0){
                //this.stopListening(webgnome.cache, 'step:received', this.renderStep);
                //webgnome.cache.off('step:received', this.renderStep, this);
                this.state = 'paused';
                clearInterval(this.rframe);
                this._canRun = true;
            }
        },

        stop: function() {
            if($('.modal:visible').length === 0){
                this.pause();
                if(webgnome.cache && webgnome.cache.streaming){
                    webgnome.cache.sendHalt();
                }
                this.state = 'stopped';
            }
        },

        rewind: function(){
            clearInterval(this.rframe);
            if (this.state !== 'stopped'){
                this.stop();
            }
            this.frame = 0;
            var time = moment(webgnome.model.get('start_time').replace('T', ' ')).format('MM/DD/YYYY HH:mm');
            this.$('.tooltip-inner').text(time);
            if (this.layersPanel) {
                this.layersPanel.resetSpills();
            }
            if (this.viewer) {
                this.viewer.scene.requestRender();
            }
        },

        rewindClick: function(e){
            clearInterval(this.rframe);
            if (this.state !== 'stopped'){
                this.stop();
            }
            this.frame = 0;
            setTimeout(_.bind(function(){
                webgnome.cache.rewind();
            }, this), 20);
        },

        updateLayers: function(step){
            for(var i = 0; i < this.layers.length; i++) {
                this.layers[i].update(step);
            }
        },

        renderStep: _.throttle(function(source){
            var step;
            if(_.has(source, 'step')){
                step = webgnome.cache.inline[source.step];
                this.drawStep(step);
                //this.drawStep(step);
                webgnome.cache.at(source.step, _.bind(function(err, step){
                    if(err){
                        console.error(err);
                    }
                }, this));

            } else {
                step = source;
                this.drawStep(step);
            }
        },16,{trailing: false}),

        drawStep: function(step){
            if(!step){ return; }
            this.renderSpill(step);
            this.renderVisLayers(step);

            var time = moment(step.get('SpillJsonOutput').time_stamp.replace('T', ' ')).format('MM/DD/YYYY HH:mm');

            this.controls.controls.date.text(time);
            this.frame = step.get('step_num');
            if(this.frame < webgnome.model.get('num_time_steps') && this.state === 'playing'){
                this.controls.controls.seek.slider('value', this.frame + 1);
            } else {
                this.pause();
                this.controls.pause();
            }
            this.$('.tooltip-inner').text(time);
            this.viewer.scene.requestRender();

            if(this.is_recording){
                if(this.capturer.skipped < this.capture_opts.skip) {
                    this.capturer.skipped++;
                } else {
                    var ctrls = $('.seek');
                    var graticule = this.graticuleContainer;
                    //$('.buttons', ctrls).hide();
                    //$('.gnome-help', ctrls).hide();
                    var ctx = this.meta_canvas_ctx;
                    var cesiumCanvas = this.viewer.canvas;

                    if(this.is_recording) {
                        html2canvas(graticule, {
                            onrendered: _.bind(function(canvas) {
                                ctx.drawImage(cesiumCanvas,0,0);
                                ctx.drawImage(canvas,0,0);
                                this.capturer.capture(this.meta_canvas);
                                this.capturer.skipped = 0;
                            }, this)});
                    }
                }
            }
        },

        /*recordScene: function() {
            var ctrls = $('.seek');
            var graticule = this.graticuleContainer;
            //$('.buttons', ctrls).hide();
            //$('.gnome-help', ctrls).hide();
            var ctx = this.meta_canvas_ctx;
            var cesiumCanvas = this.viewer.canvas;

            if(this.is_recording) {
                html2canvas(graticule, {
                    onrendered: function(canvas) {
                        ctx.drawImage(cesiumCanvas,0,0);
                        ctx.drawImage(canvas,0,0);
                    }});
            }
        },*/

        renderSpill: function(step){
            var spills = webgnome.model.get('spills').models;
            for (var s = 0; s < spills.length; s++) {
                spills[s].update(step);
            }
        },

        renderCurrent: function(step){
            if(step.get('CurrentJsonOutput') && this.checked_currents && this.checked_currents.length > 0 && this.layers.uv){
                // hardcode to the first indexed id, because the ui only supports a single current being selected at the moment
                var id = this.checked_currents[0];
                var data = step.get('CurrentJsonOutput')[id];
                if(data && this.current_arrow[id]){
                    for(var uv = data.direction.length; uv--;){
                        this.layers.uv[id].get(uv).show = true;
                        if(this.layers.uv[id].get(uv).rotation !== data.direction[uv]){
                            this.layers.uv[id].get(uv).rotation = data.direction[uv];
                        }
                        if(this.layers.uv[id].get(uv).image !== this.uvImage(data.magnitude[uv], id)){
                            this.layers.uv[id].get(uv).image = this.uvImage(data.magnitude[uv], id);
                        }
                        this.layers.uv[id].get(uv).dir = data.direction[uv];
                        this.layers.uv[id].get(uv).mag = data.magnitude[uv];
                    }
                } else if(this.layers.uv[id]){
                    for(var h = this.layers.uv[id].length; h--;){
                        this.layers.uv[id].get(h).show = false;
                    }
                }
            }
        },

        renderVisLayers: function(step){
            // select only layers prepended with 'uv-' and appearance is on
            var lays = this.layersPanel.layers.filter(function(l) {
                return l.id.includes('uv-') && (l.appearance.get('vec_on') || l.appearance.get('on'));
            });
            for(var i = 0; i < lays.length; i++){
                    lays[i].model.update(step);
            }
        },

        uvImage: function(magnitude, id){
            return this.current_arrow[id][Math.round(Math.abs(magnitude)*10)/10];
        },

        toggleGrid: function(e){
            if(!this.grids){
                this.grids = {};
            }
            var existing_grids = _.keys(this.grids);
            for(var grid = 0; grid < existing_grids.length; grid++){
                for(var prims = this.grids[existing_grids[grid]].length; prims--;){
                    this.grids[existing_grids[grid]][prims].show = false;
                }
            }

            var id = this.$(e.currentTarget).attr('id').replace('grid-', '');
            if(_.has(this.grids, id)){
                // need to hide the entire set of grids.
                for(var active_prim = this.grids[id].length; active_prim--;){
                    this.grids[id][active_prim].show = true;
                }
            } else if(id !== 'none-grid'){
                var current = webgnome.model.get('movers').findWhere({id: id});
                current.getGrid().then(_.bind(function(data){
                    var color = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.PINK.withAlpha(0.3));
                    this.grids[current.get('id')]  = [];
                    var batch = 3000;
                    var batch_limit = Math.ceil(data.length / batch);
                    var segment = 0;
                    for(var b = 0; b < batch_limit; b++){
                        // setup the new batch
                        var geo = [];

                        // build the batch
                        var limit = segment + batch;
                        for(var cell = segment; cell < limit; cell++){
                            if(data[cell]){
                                geo.push(new Cesium.GeometryInstance({
                                    geometry: new Cesium.SimplePolylineGeometry({
                                        positions: Cesium.Cartesian3.fromDegreesArray(data[cell])
                                    }),
                                    attributes: {
                                        color: color
                                    },
                                    allowPicking: false
                                }));
                            }
                        }

                        segment += batch;

                        // send the batch to the gpu/cesium
                        this.grids[current.get('id')].push(this.viewer.scene.primitives.add(new Cesium.Primitive({
                            geometryInstances: geo,
                            appearance: new Cesium.PerInstanceColorAppearance({
                                flat: true,
                                translucent: false
                            })
                        })));
                    }

                }, this));
            }
        },

        toggleUV: function(e){
            var checked = this.$('.current-uv input:checked, .ice-uv input:checked');
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.CurrentJsonOutput'});

            var uv_layers = _.keys(this.layers.uv);
            for(var l = 0; l < uv_layers.length; l++){
                for(var bb = this.layers.uv[uv_layers[l]].length; bb--;){
                    this.layers.uv[uv_layers[l]].get(bb).show = false;
                }
            }

            var id = $(checked[0]).attr('id').replace('uv-', '');
            if (checked.length > 0 && id !== 'none-uv'){
                current_outputter.get('current_movers').reset();
                this.checked_currents = [];

                this.$('.current-uv input:checked, .ice-uv input:checked').each(_.bind(function(i, input){
                    var current = webgnome.model.get('movers').get(id);
                    current.getCenters(_.bind(function(centers){
                        if(!this.layers.uv){
                            this.layers.uv = {};
                        }

                        if(!this.layers.uv[id]){
                            this.layers.uv[id] = new Cesium.BillboardCollection();
                            this.viewer.scene.primitives.add(this.layers.uv[id]);
                            this.generateUVTextures(this.layers.uv[id], id);
                        }

                        var layer = this.layers.uv[id];

                        // update the positions of any existing centers
                        var existing_length = this.layers.uv[id].length;
                        for(var existing = 0; existing < existing_length; existing++){
                            layer.get(existing).position = Cesium.Cartesian3.fromDegrees(centers[existing][0], centers[existing][1]);
                            layer.get(existing).show = false;
                        }

                        var create_length = centers.length;
                        for(var c = existing_length; c < create_length; c++){
                            layer.add({
                                show: false,
                                position: Cesium.Cartesian3.fromDegrees(centers[c][0], centers[c][1]),
                                image: this.current_arrow[id][0]
                            });
                        }
                    }, this));

                    this.checked_currents.push(id);
                    current_outputter.get('current_movers').add(current);
                }, this));
            } else {
                current_outputter.get('current_movers').reset();
                this.checked_currents = [];
            }
            if(this.state === 'pause'){
                this.renderStep({step: this.frame});
            }

            current_outputter.save();
        },

        generateUVTextures: function(layer, id){
            if(!this.current_arrow){
                this.current_arrow = {};
            }
            if(!this.current_arrow[id]){
                this.current_arrow[id] = {};
                // generate a canvas based texture for each size arrow we want
                // 0.0, 0.1, 0.2, etc...

                var canvas = document.createElement('canvas');
                canvas.width = 7;
                canvas.height = 7;
                var ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(1, 1, 0.5, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(204, 0, 204, 1)';
                ctx.stroke();
                this.current_arrow[id][0] = layer.add({
                    image: canvas,
                    show: false,
                    id: 0,
                }).image;

                var angle = Math.PI/5;
                var width = 45;
                var center = width / 2;

                for(var a = 0.1; a < 3.0; a += 0.1){
                    var s_a = Math.round(a*10)/10;
                    canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = s_a * 80;
                    ctx = canvas.getContext('2d');

                    var len = Math.abs(canvas.height / Math.log(canvas.height));
                    var rad = Math.PI / 2;

                    var arr_left = [(center + len * Math.cos(rad - angle)), (0 + len * Math.sin(rad - angle))];
                    var arr_right =[(center + len * Math.cos(rad + angle)), (0 + len * Math.sin(rad + angle))];

                    ctx.moveTo(center, canvas.height/2);
                    ctx.lineTo(center, 0);
                    ctx.lineTo(arr_right[0], arr_right[1]);
                    ctx.moveTo(arr_left[0], arr_left[1]);
                    ctx.lineTo(center, 0);
                    ctx.strokeStyle = 'rgba(204, 0, 204, 1)';
                    ctx.stroke();

                    this.current_arrow[id][s_a] = layer.add({
                        image: canvas,
                        show: false,
                    }).image;
                }
            }
        },

        toggleIceTC: function(e){
            var checked = this.$('.ice-tc input[type="checkbox"]:checked');
            // var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.geo_json.IceGeoJsonOutput'});
            var current_outputter = webgnome.model.get('outputters').findWhere({obj_type: 'gnome.outputters.json.IceJsonOutput'});
            if (checked.length > 0){
                current_outputter.get('ice_movers').reset();

                this.$('.ice-tc input[type="checkbox"]:checked').each(_.bind(function(i, input){
                    var id = input.id.replace('tc-', '');
                    var current = webgnome.model.get('movers').get(id);
                    current.getGrid(_.bind(function(grid){
                        if(!this.layers.ice){
                            var ice = [];
                            for(var cell = grid.length; cell--;){
                                ice.push(new Cesium.GeometryInstance({
                                    geometry: new Cesium.PolygonGeometry({
                                        polygonHierarchy: {
                                            positions: Cesium.Cartesian3.fromDegreesArray(grid[cell])
                                        },
                                        vertextFormat: Cesium.VertexFormat.POSITION_AND_COLOR
                                    }),
                                    'id': cell,
                                    attributes: {
                                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE.withAlpha(0))
                                    }
                                }));
                            }
                            if(ice.length > 0){
                                this.layers.ice = this.viewer.scene.primitives.add(new Cesium.Primitive({
                                    geometryInstances: ice,
                                    appearance: new Cesium.PerInstanceColorAppearance({
                                        flat: true,
                                        translucent: true
                                    })
                                }));
                                this.layers.ice.readyPromise.then(_.bind(function(){
                                    this.ice_grid = [];
                                    for(cell = grid.length; cell--;){
                                        this.ice_grid.push(this.layers.ice.getGeometryInstanceAttributes(cell));
                                    }
                                    this.ice_grid.reverse();
                                }, this));
                            }
                        } else {
                            this.layers.ice.show = true;
                        }
                    }, this));
                    current_outputter.get('ice_movers').add(current);
                }, this));
            } else {
                current_outputter.get('ice_movers').reset();
                this.layers.ice.show = false;
            }

            if(this.state === 'pause'){
                this.renderStep({step: this.frame});
            }
            current_outputter.save();
        },

        toggleIceData: function(e){
            this.renderStep({step: this.frame});
        },

        showHelp: function(){
            this.$('.help-button').show();
        },

        helpBlur: function(e){
            e.target.blur();
        },

        blur: function(e, ui){
            ui.handle.blur();
        },

        close: function(){
            this.pause();
            if (this.controls) {
                this.controls.pause();
            }
            this.$el.hide();
            // this.remove();
        }
    });
    return trajectoryView;
});
