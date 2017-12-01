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
        numAck: 0,
        model: StepModel,

        initialize: function(options){
            // this.gnome_model.on('sync', _.bind(this.checkState, this));
            localforage.config({
                name: 'WebGNOME Cache',
                storeName: 'webgnome_cache'
            });
        },

        checkState: function(){
            this.rewind();
        },

        step: function(){
            var step = new StepModel();
            this.trigger('step:sent');
            if(!this.fetching){
                this.fetching = true;
                step.fetch({
                    success: _.bind(function(step){
                        this.inline.push(step);
                        this.fetching = false;
                        this.length++;
                        this.trigger('step:received', step);
                    }, this),
                    error: _.bind(function(){
                        this.fetching = false;
                        this.trigger('step:failed');
                    }, this)
                });
            }
        },

        rewind: function(override){
            if(this.length > 0 || override === true){
                $.get('/rewind', _.bind(function(){
                    this.length = 0;
                    this.inline = [];
                    if(this.streaming) {
                        this.socket.emit('kill');
                        this.streaming = false;
                    }
                    this.trigger('rewind');
                }, this));
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

        socketConnect: function(){
            //console.log('Attaching logger socket routes...');
            console.log('Connecting to step namespace');
                if(!this.socket){
                this.socket = io.connect(webgnome.config.api + this.socketRoute);
                this.socket.on('step', _.bind(this.socketProcessStep, this));
                this.socket.on('prepared', _.bind(this.begin,this));
                this.socket.on('sync_step', _.bind(this.syncClient, this));
                this.socket.on('complete', _.bind(this.endStream, this));
                this.socket.on('timeout', _.bind(this.timedOut, this));
                this.socket.on('killed', _.bind(this.killed, this));
            }
        },
        stepStarted: function(event){
            console.log('step namespace started on api');
        },
        socketProcessStep: function(step){
            if(this.streaming) {
                var sm = new StepModel(step);
                this.inline.push(sm);
                this.length++;
                this.trigger('step:buffered');
                this.trigger('step:received', sm);
                if(!this.isAsync){
                    this.sendStepAck(step);
                }
            }
        },
        begin: function() {
            // this is this.socket.connected in socket.io v1.0+
            if(!this.streaming){
                this.sendStepAck({step:-1});
                this.streaming = true;
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
            if(this.isHalted) {
                console.log('resuming model');
                this.socket.emit('ack', this.length);
            }
            this.isHalted = false;
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
            if(!this.streaming) {
                // this is this.socket.connected in socket.io v1.0+
                if(!this.socket){
                    this.socketConnect();
                }
                var step = new AsyncStepModel();
                step.fetch({
                    success: _.bind(function(step){
                        console.log('getSteps success!');
                    }, this),
                    error: _.bind(function(){
                        console.log('getSteps success!');
                    }, this)
                });
            }
        },

        endStream: function(msg) {
            this.streaming = false;
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

        killed: function(msg) {
            this.endStream(null);
            if(msg){
                console.error('Model run killed.');
            } else {
                console.error(msg);
            }
        }
    });

    return cache;
});
