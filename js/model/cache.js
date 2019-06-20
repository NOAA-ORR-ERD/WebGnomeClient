define([
    'jquery',
    'underscore',
    'backbone',
    'localforage',
    'socketio',
    'model/step',
    'model/async_step'
], function($, _, Backbone, localforage, io, StepModel, AsyncStepModel){
    'use strict';
    var cache = Backbone.Collection.extend({
        socketRoute: '/step_socket',
        fetching: false,
        inline: [],
        isAsync: true,
        isHalted: false,
        isDead: false, //set if model on server is finished. reset during rewind
        numAck: 0,
        model: StepModel,

        initialize: function(options){
            // this.gnome_model.on('sync', _.bind(this.checkState, this));
            localforage.config({
                name: 'WebGNOME Cache',
                storeName: 'webgnome_cache'
            });
            this.rewind();
        },

        checkState: function(){
            this.rewind();
        },

        rewind: function(override){
            if(this.length > 0 || override === true){
                if (webgnome.router.trajView) {
                    //last minute reset of trajectory view if it exists.
                    webgnome.router.trajView.renderVisLayers(this.inline[0]);
                }
                $.get('/rewind', _.bind(function(){
                    this.length = 0;
                    this.inline = [];
                    this.isDead = false;
                    if(this.streaming) {
                        this.socket.emit('kill');
                        this.streaming = false;
                    }
                    this.trigger('rewind');
                }, this));
            } else { // if something fails on step 0, need to be able to reset without triggering a rewind everywhere
                this.length = 0;
                this.inline = [];
                this.isDead = false;
                if(this.streaming) {
                    this.socket.emit('kill');
                    this.streaming = false;
                }
            }
        },

        add: function(models, options){
            var key;
            if(_.isArray(models)){
                for(var m = 0; m < models.length; m++){
                    key = this.length;
                    if(m === models.length - 1){
                       localforage.setItem(key.toString(), models[m].attributes, options.success);
                    } else {
                        localforage.setItem(key.toString(), models[m].attributes);
                    }
                    this.length++;
                }
            } else {
                key = this.length;
                localforage.setItem(key.toString(), models.attributes, options.success);
                this.length++;
            }
        },

        at: function(index, cb){
            if(this.length > index && index >= 0){
                return cb(false, this.inline[index]);
            }
        },

        socketConnect: function() {
            //console.log('Attaching logger socket routes...');
            console.log('Connecting to step namespace');
            if (!this.socket) {
                this.socket = io.connect(webgnome.config.socketio + this.socketRoute);

                this.socket.on('step', _.bind(this.socketProcessStep, this));
                this.socket.on('prepared', _.bind(this.begin,this));
                this.socket.on('sync_step', _.bind(this.syncClient, this));
                this.socket.on('complete', _.bind(this.endStream, this));
                this.socket.on('timeout', _.bind(this.timedOut, this));
                this.socket.on('killed', _.bind(this.killed, this));
                this.socket.on('runtimeError', _.bind(this.runtimeError, this));
            }
        },

        stepStarted: function(event) {
            console.log('step namespace started on api');
        },

        socketProcessStep: function(step) {
            if (this.streaming) {
                var sm = new StepModel(step);
                this.inline.push(sm);
                this.length++;
                this.trigger('step:buffered');
                this.trigger('step:received', sm);
 
                if (!this.isAsync) {
                    this.sendStepAck(step);
                }
            }
        },

        begin: function() {
            // this is this.socket.connected in socket.io v1.0+
            if(!this.streaming && !this.isDead){
                this.sendStepAck({step:-1});
                this.streaming = true;
                this.preparing = false;
            }
        },

        setAsync: function(b){
            b = Boolean(b);
            this.isAsync = b;
            this.socket.emit('isAsync', this.isAsync);
        },
        syncClient: function(step) {
            this.socketProcessStep(step);
        },

        sendHalt: function() {
            console.log('halting model. cache length: ', this.length);
            if (!_.isUndefined(this.socket)){
                this.socket.emit('halt');
            }
            this.isHalted = true;
        },

        resume: function() {
            if(this.isHalted && !this.isDead) {
                console.log('resuming model');
                this.socket.emit('ack', this.length);
                this.isHalted = false;
            }
        },

        sendStepAck: function(step) {
            if(step.step_num) {
                this.socket.emit('ack', step.step_num);
            } else {
                console.log('step has no step_num, using cache length');
                this.socket.emit('ack', this.length);
            }
            this.numAck++;
        },

        getSteps: function() {
            if(!this.streaming && !this.isDead) {
                // this is this.socket.connected in socket.io v1.0+
                if(!this.socket){
                    this.socketConnect();
                }
                this.preparing = true;
                var step = new AsyncStepModel();
                step.fetch({
                    success: _.bind(function(step){
                        console.log('getSteps success!');
                    }, this),
                    error: _.bind(function(){
                        console.error('getSteps error!');
                        this.preparing = false;
                    }, this)
                });
            }
        },

        endStream: function(msg) {
            this.streaming = false;
            if(this.length > 0) {
                this.isDead = true;
            }
            this.isHalted = false;
            if(msg){
                console.info(msg);
            }
            this.trigger('step:done');
            this.trigger('complete');
            //this.socket.removeAllListeners()
            this.socket.disconnect();
        },

        timedOut: function(msg) {
            this.streaming = false;
            this.isHalted = false;
            this.trigger('step:timeout');
            if(msg){
                console.error('Model run timed out.');
            } else {
                console.error(msg);
            }
            //this.socket.removeAllListeners();
            this.socket.disconnect();
        },

        runtimeError: function(msg) {
            this.trigger('step:failed');

            if (this.length >= 0) {
                this.isDead = true;
            }

            this.streaming = false;
            this.isHalted = false;
            this.socket.disconnect();

            if (msg) {
                console.error(msg);
            }
            else {
                console.error('Model runtime error');
            }
        },

        killed: function(msg) {
            this.trigger('step:failed');
            this.endStream(msg);
            if(msg){
                console.error(msg);
            } else {
                console.error('Model run killed.');
            }
        }
    });

    return cache;
});
