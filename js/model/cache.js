define([
    'jquery',
    'underscore',
    'backbone',
    'localforage',
    'model/step',
    'model/async_step'
], function($, _, Backbone, localforage, StepModel, AsyncStepModel){
    'use strict';
    var cache = Backbone.Collection.extend({
        socketRoute: '/step_socket',
        fetching: false,
        inline: [],
        isAsync: true,
        numAck: 0,
        model: StepModel,

        initialize: function(options, model){
            this.gnome_model = model;
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
                    this.trigger('rewind');
                    this.reset();
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

        reset: function(){
            this.length = 0;
            this.trigger('reset');
            this.inline = [];
        },

        socketConnect: function(){
            //console.log('Attaching logger socket routes...');
            console.log('Connecting to step namespace');
            console.trace();
            this.socket = io.connect(webgnome.config.api + this.socketRoute);
            this.socket.on('step', _.bind(this.socketProcessStep, this));
            this.socket.on('step_started', _.bind(this.stepStarted,this));
            this.socket.on('end', _.bind(this.endStream, this));
        },
        stepStarted: function(event){
            console.log('step namespace started on api');
        },
        socketProcessStep: function(step){
            
            this.inline.push(new StepModel(step));
            this.length++;
            this.trigger('step:buffered');
            //if(this.length === 1) {
                this.trigger('step:received', {step: step.step_num});
            //}
            if(!this.isAsync) {
                this.sendStepAck(step)
            }
        },
        setAsyncOn: function() {
            if(!this.isAsync) {
                this.isAsync = false;
                this.socket.emit('isAsync', this.isAsync);
            }
        },
        setAsyncOff: function() {
            if(this.isAsync) {
                this.isAsync = false;
                this.socket.emit('isAsync', this.isAsync);
            }
        },
        sendHalt: function() {
            console.log('halting model. cache length: ', this.length);
            this.socket.emit('halt');
        },
        sendStepAck: function(step) {
            if(step.step_num) {
                this.socket.emit('ack', step.step_num, this.numAck);
            } else {
                console.log('step has no step_num, using cache length');
                this.socket.emit('ack', this.length, this.numAck);
            }
            this.numAck++;
        },

        getSteps: function() {
            var step = new AsyncStepModel();
            this.streaming = true;
            this.socketConnect();
            step.fetch({
                success: _.bind(function(step){
                    console.log('getSteps success!')
                }, this),
                error: _.bind(function(){
                    console.log('getSteps success!')
                }, this)
            });
        },

        endStream: function() {
            this.streaming = false;
            this.trigger('step:done');
            this.socket.removeAllListeners()
            this.socket.disconnect()
        },

        haltSteps: function() {
            this.socket.emit('haltSteps', localStorage.getItem('session'));
        },

    });

    return cache;
});