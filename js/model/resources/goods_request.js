define([
    'underscore',
    'jquery',
    'model/base',
    'model/movers/py_current',
    'model/movers/py_wind'
], function(_, $, BaseModel, PyCurrentMover, PyWindMover) {
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
        },

        initialize: function(options) {
            this.listenTo(this, 'change', this.changeStatusHandler)
            BaseModel.prototype.initialize.call(this, options);
        },

        changeStatusHandler(newStatus){
            if (newStatus === 'finished'){
                self.convertToMover().then(_.bind(function(rv){
                    this.set('status', 'dead', {silent:true});
                    this.trigger('converted');
                    this.trigger('rerender');
                },this));
            } else {
                this.trigger('rerender');
            }            
        },

        parse: function(response, options){
            return BaseModel.prototype.parse.call(this, response, options);
        },

        windPromiseFunc: function(resolve, reject) {
            var mod = webgnome.model.get('movers').findWhere({filename: this.get('filename')});
            var obj_type = PyWindMover.prototype.defaults.obj_type
            if (!webgnome.isUorN(mod)){
                resolve(mod);
            } else {
                $.post({
                    url: webgnome.config.api + '/mover/upload',
                    data: {'file_list': JSON.stringify(this.get('outpath')),
                        'obj_type': obj_type,
                        'name': this.get('filename'),
                        'session': localStorage.getItem('session'),
                        'tshift': 0,
                    },
                    crossDomain: true,
                    dataType: 'json',
                    //contentType: 'application/json',
                    xhrFields: {
                        withCredentials: true
                    },
                }).done(_.bind(function(json_response){
                    var mover = new PyWindMover(json_response, {parse: true});
                    webgnome.model.get('movers').add(mover);
                    webgnome.model.get('environment').add(mover.get('wind'));
                    webgnome.model.save(undefined, {
                        success: _.bind(function(){
                            webgnome.model.get('movers').trigger('sync', mover);
                            resolve(mover);
                        }, this)
                    });
                },this)).fail(
                    reject
                )
            }
        },

        currentPromiseFunc: function(resolve, reject) {
            var mod = webgnome.model.get('movers').findWhere({filename: this.get('filename')});
            var obj_type = PyCurrentMover.prototype.defaults.obj_type;
            if (!webgnome.isUorN(mod)){
                resolve(mod);
            } else {
                $.post({
                    url: webgnome.config.api + '/mover/upload',
                    data: {'file_list': JSON.stringify(this.get('outpath')),
                        'obj_type': obj_type,
                        'name': this.get('filename'),
                        'session': localStorage.getItem('session'),
                        'tshift': 0,
                    },
                    crossDomain: true,
                    dataType: 'json',
                    //contentType: 'application/json',
                    xhrFields: {
                        withCredentials: true
                    },
                }).done(_.bind(function(json_response){
                    var mover = new PyCurrentMover(json_response, {parse: true});
                    webgnome.model.get('movers').add(mover);
                    webgnome.model.get('environment').add(mover.get('current'));
                    webgnome.model.save(undefined, {
                        success: _.bind(function(){
                            webgnome.model.get('movers').trigger('sync', mover);
                            resolve(mover);
                        }, this)
                    });
                },this)).fail(
                    reject
                )
            }
        },

        convertToMover: function(retry) {
            if (this._conversionPromise && !retry) {
                return this._conversionPromise;
            } else {
                var windPromise, currentPromise;
                var proms = [];
                if (this.get('request_type').includes('wind')){
                    windPromise = new Promise(_.bind(this.windPromiseFunc, this));
                    proms.push(windPromise);
                }
                if (this.get('request_type').includes('current')){
                    currentPromise = new Promise(_.bind(this.currentPromiseFunc, this));
                    proms.push(currentPromise);
                }
                this._conversionPromise = Promise.all([windPromise, currentPromise]);
                return this._conversionPromise;
            }
        },

        confirmConversion: function() {
            $.post(webgnome.config.api+'/goods_requests',
                    {session: localStorage.getItem('session'),
                     command: 'cleanup',
                     request_id: this.get('request_id')
                    }
                ).done(_.bind(function(request_obj){
                    console.log(request_obj);
                    this.trigger('success');
                }, this));
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
