define([
    'underscore',
    'jquery',
    'sweetalert',
    'model/base',
    'model/movers/py_current',
    'model/movers/py_wind'
], function(_, $, swal, BaseModel, PyCurrentMover, PyWindMover) {
    'use strict';
    var goodsRequest = BaseModel.extend({
        urlRoot: 'goods_requests/',
        defaults: {
            start_time: undefined,
            type: undefined,
            size: undefined,
            request_id: undefined,
            filename: undefined,
            status: undefined,
            outpath: undefined,
            time_elapsed: 0,
        },

        initialize: function(options) {
            this.listenTo(this, 'change', this.changeStatusHandler);
            this.error_status = undefined;
            BaseModel.prototype.initialize.call(this, options);
        },

        changeStatusHandler(newStatus){
            if (newStatus === 'finished'){
                this.convertToMover().then(_.bind(function(rv){
                    webgnome.model.save({
                        success: _.bind(function(){
                            this.set('status', 'dead', {silent:true});
                            this.trigger('converted');
                            this.trigger('rerender');
                        }, this)
                    });
                },this));
            } else {
                this.trigger('rerender');
            }            
        },

        parse: function(response, options){
            return BaseModel.prototype.parse.call(this, response, options);
        },

        windAndCurrentTest: function(){
            return this.get('request_type').includes('surface winds') &&
                (this.get('request_type').includes('surface currents') || this.get('request_type').includes('3D currents'));
        },

        windPromiseFunc: function(resolve, reject) {
            var mod = webgnome.model.get('movers').findWhere({filename: this.get('filename')});
            var obj_type = PyWindMover.prototype.defaults.obj_type;
            if (!webgnome.isUorN(mod)){
                resolve(mod);
            } else {
                var name = this.get('filename');
                if (this.windAndCurrentTest()){
                    name += '_wind';
                }
                $.post({
                    url: webgnome.config.api + '/mover/upload',
                    data: {'file_list': JSON.stringify(this.get('outpath')),
                        'obj_type': obj_type,
                        'name': name,
                        'session': localStorage.getItem('session'),
                    },
                    crossDomain: true,
                    dataType: 'json',
                    //contentType: 'application/json',
                    xhrFields: {
                        withCredentials: true
                    },
                }).done(_.bind(function(json_response){
                    var mover = new PyWindMover(json_response, {parse: true});
                    mover.get('wind').set('timezone_offset',webgnome.model.get('timezone_offset'));
                    webgnome.model.get('movers').add(mover);
                    webgnome.model.get('environment').add(mover.get('wind'));
                    resolve(mover);
                },this)).fail(_.bind(function(json_response){
                    this.error_status = ['File Error', json_response.responseJSON.message];
                    this.trigger('rerender');

                    swal.fire({
                        title: 'Object Creation Error',
                        html: 'An error has occured during creation of the requested Current or Wind.<br/><br/><code>' + json_response.responseText + '</code>',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                },this));
                    
            }
        },

        currentPromiseFunc: function(resolve, reject) {
            var mod = webgnome.model.get('movers').findWhere({filename: this.get('filename')});
            var obj_type = PyCurrentMover.prototype.defaults.obj_type;
            if (!webgnome.isUorN(mod)){
                resolve(mod);
            } else {
                var name = this.get('filename');
                if (this.windAndCurrentTest()){
                    name += '_current';
                }
                $.post({
                    url: webgnome.config.api + '/mover/upload',
                    data: {'file_list': JSON.stringify(this.get('outpath')),
                        'obj_type': obj_type,
                        'name': name,
                        'session': localStorage.getItem('session'),
                    },
                    crossDomain: true,
                    dataType: 'json',
                    //contentType: 'application/json',
                    xhrFields: {
                        withCredentials: true
                    },
                }).done(_.bind(function(json_response){
                    var mover = new PyCurrentMover(json_response, {parse: true});
                    mover.get('current').set('timezone_offset',webgnome.model.get('timezone_offset'));
                    webgnome.model.get('movers').add(mover);
                    webgnome.model.get('environment').add(mover.get('current'));
                    resolve(mover);
                },this)).fail(_.bind(function(json_response){
                    this.error_status = ['File Error', json_response.responseJSON.message];
                    this.trigger('rerender');

                    swal.fire({
                        title: 'Object Creation Error',
                        html: 'An error has occured during creation of the requested Current or Wind.<br/><br/><code>' + json_response.responseText + '</code>',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                },this));
            }
        },

        convertToMover: function(retry) {
            if (this._conversionPromise && !retry) {
                return this._conversionPromise;
            } else {
                var windPromise, currentPromise;
                var proms = [];
                if (this.get('request_type').includes('surface winds')){
                    windPromise = new Promise(_.bind(this.windPromiseFunc, this));
                    proms.push(windPromise);
                }
                if (this.get('request_type').includes('surface currents') || this.get('request_type').includes('3D currents')){
                    currentPromise = new Promise(_.bind(this.currentPromiseFunc, this));
                    proms.push(currentPromise);
                }
                this._conversionPromise = Promise.all(proms);
                return this._conversionPromise;
            }
        },

        confirmConversion: function() {
            //This function should be called by the callback waiting on _conversionPromise to complete.
            //It cleans up the leftover goods request
            $.post(webgnome.config.api+'/goods_requests',
                    {session: localStorage.getItem('session'),
                     command: 'cleanup',
                     request_id: this.get('request_id')
                    }
                ).done(_.bind(function(request_obj){
                    console.log(request_obj);
                    this.set('state', 'converted');
                    this.trigger('success');
                    webgnome.model.save();
                }, this));
        },

        download: function() {
            if (this.get('state') !== 'finished'){
                console.error('Goods request not complete, cannot download`');
                return;
            }
            webgnome.invokeSaveAsDialog(webgnome.config.api + '/user_files?filename=' + JSON.stringify(this.get('filename')));
        },

        cancel: function() {
            $.post(webgnome.config.api+'/goods_requests',
                    {session: localStorage.getItem('session'),
                     command: 'cancel',
                     request_id: this.get('request_id')
                    },
                    {
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true
                    }
                ).done(_.bind(function(request_obj){
                    console.log(request_obj);
                    this.trigger('success');
                }, this));
        },

        retry: function() {
            $.post(webgnome.config.api+'/goods_requests',
                    {session: localStorage.getItem('session'),
                     command: 'retry',
                     request_id: this.get('request_id')
                    },
                    {
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true
                    }
                ).done(_.bind(function(request_obj){
                    console.log(request_obj);
                    this.trigger('success');
                }, this));
                this._conversionPromise = undefined;
                this.error_status = undefined;
        },
        
        _debugPause: function() {
            $.post(webgnome.config.api+'/goods_requests',
                    {session: localStorage.getItem('session'),
                     command: '_debugPause',
                     request_id: this.get('request_id')
                    },
                    {
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true
                    }
                ).done(_.bind(function(request_obj){
                    console.log(request_obj);
                    this.trigger('success');
                }, this));

        }

    });

    return goodsRequest;
});
