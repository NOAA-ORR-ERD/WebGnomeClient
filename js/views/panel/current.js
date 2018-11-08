define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'sweetalert',
    'text!templates/panel/current.html',
    'views/default/cesium',
    'views/panel/base',
    'views/form/mover/create',
    'views/form/mover/grid',
    'views/form/mover/cats',
    'views/form/mover/component',
    'views/modal/base',
    'views/modal/form'
], function($, _, Backbone, Cesium, swal,
            CurrentPanelTemplate, CesiumView, BasePanel,
            CreateMoverForm, GridMoverForm, CatsMoverForm, ComponentMoverForm,
            BaseModal, FormModal) {
    var currentPanel = BasePanel.extend({
        className: 'col-md-3 current object panel-view',

        models: [
            'gnome.movers.current_movers.CatsMover',
            'gnome.movers.current_movers.ComponentMover',
            'gnome.movers.current_movers.GridCurrentMover',
            'gnome.movers.py_current_movers.PyCurrentMover',
            'gnome.movers.current_movers.CurrentCycleMover'
        ],

        forms: {
            'gnome.movers.current_movers.CatsMover': CatsMoverForm,
            'gnome.movers.current_movers.ComponentMover': ComponentMoverForm
        },
        events: {
            'click #mini-currentmap': 'openMapModal',
            'click .single': 'changeDisplayedCurrent',
            'webkitfullscreenchange #mini-currentmap': 'resetCamera'
        },

        initialize: function(options) {
            BasePanel.prototype.initialize.call(this, options);
            //_.extend({}, BasePanel.prototype.events, this.events);
            _.extend(this.events, BasePanel.prototype.events);
            this.currentPrims = {};
            this.listenTo(webgnome.model,
                          'change:duration chage:start_time',
                          this.rerender);
            this.listenTo(webgnome.model.get('movers'),
                          'add change remove',
                          this.rerender);
        },

        new: function() {
            var form = new CreateMoverForm();

            form.on('hidden', form.close);
            form.on('save', _.bind(function(mover) {
                mover.save(null, {
                    success: _.bind(function() {
                        webgnome.model.get('movers').add(mover);

                        if (mover.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                            webgnome.model.get('environment').add(mover.get('current'));
                        }

                        webgnome.model.save(null, {validate: false}).then(_.bind(function() {
                            if (mover.get('obj_type') === 'gnome.movers.current_movers.CatsMover') {
                                var form = new CatsMoverForm(null, mover);

                                form.on('save', function() {
                                    form.on('hidden', form.close);
                                });

                                form.on('wizardclose', form.close);

                                form.render();    
                            }
                        }, this));
                    }, this)
                });
            }, this));

            form.render();
        },

        edit: function(e) {
            e.stopPropagation();
            var id = this.getID(e);

            var currentMover = webgnome.model.get('movers').get(id);
            var form = this.getForm(currentMover.get('obj_type'));
            var currentForm = new form(null, currentMover);

            currentForm.on('save', function() {
                currentForm.on('hidden', currentForm.close);
            });

            currentForm.on('wizardclose', currentForm.close);

            currentForm.render();
        },

        openMapModal: function(e) {
            if(!_.isUndefined(this.currentMap)){
                this.currentMap.el.webkitRequestFullScreen();
            }
        },

        resetCamera: function(e) {
            //timeout so transition to/from fullscreen can complete before recentering camera
            setTimeout(_.bind(function(){this._focusOnCurrent(this.displayedCurrent);}, this), 100);
        },

        _focusOnCurrent: function(cur) {
            if (_.isUndefined(this.currentMap)) {
                return;
            } else {
                cur.getBoundingRectangle().then(_.bind(function(rect) {
                    this.currentMap.viewer.scene.camera.flyTo({
                        destination: rect,
                        duration: 0
                    });
                    this.currentMap.viewer.scene.requestRender();
                }, this));
            }
        },

        changeDisplayedCurrent: function(e) {
            if (_.isUndefined(this._loadPrimitivesPromise)) {
                //too early to call this function, there's no currents loaded to change to!
                return;
            } else {
                this._loadPrimitivesPromise.then(_.bind(function(){
                    this.currentPrims[this.displayedCurrent.get('id')].show = false;
                    var curId = e.currentTarget.getAttribute('data-id');
                    var cur = webgnome.model.get('movers').findWhere({'id': curId});
                    if (cur) {
                        this.displayedCurrent = cur;
                        var prim = this.currentPrims[cur.get('id')];
                        if (_.isUndefined(prim)){
                            console.error('Primitive for current '+ cur.get('name') + ' not found');
                            return;
                        }
                        prim.show = true;
                        this.resetCamera();
                    }
                },this));
            }
        },

        render: function() {
            var currents = webgnome.model.get('movers').filter(function(mover) {
                return [
                    'gnome.movers.current_movers.CatsMover',
                    'gnome.movers.current_movers.GridCurrentMover',
                    'gnome.movers.py_current_movers.PyCurrentMover',
                    'gnome.movers.current_movers.ComponentMover',
                    'gnome.movers.current_movers.CurrentCycleMover'
                ].indexOf(mover.get('obj_type')) !== -1;
            });

            var compiled = _.template(CurrentPanelTemplate, {
                currents: currents
            });

            this.$el.html(compiled);

            if (currents.length > 0) {
                this.$el.removeClass('col-md-3').addClass('col-md-6');
                this.$('.panel-body').show({
                    duration: 10,
                    done: _.bind(function(){
                        if (!this.currentMap){
                            this.currentMap = CesiumView.getView('currents_panel');
                            this.currentMap.render();
                            this.displayedCurrent = currents[0];
                            var p, cur_id;
                            this._loadPrimitives([currents[0]]).then(_.bind(function() {
                                //on first load, always display first current
                                this.currentPrims[currents[0].get('id')].show = true;
                                this.resetCamera(currents[0]);
                                this._loadPrimitives(currents.slice(1));
                            },this));
                        }
                        this.$('#mini-currentmap').append(this.currentMap.$el);
                        this.resetCamera(currents[0]);
                        this.trigger('render');
                    }, this)
                });
            }
            else {
                this.current_extents = [];
                this.$('.panel-body').hide();
            }

            BasePanel.prototype.render.call(this);
        },

        _loadPrimitives: function(currents) {
            //This promise populates this.currentPrims with any existing primitives in
            //this panel's CesiumView, and if not found, creates new Primitives and adds them
            //to both the CesiumView and this.currentPrims.
            //This function exists to initialize this panel's state in the case where it is
            //using a cached CesiumView
            var promises = [];
            var ctxt;
            for (var c = 0; c < currents.length; c++) {
                //To future me: I am so sorry for this. 
                ctxt = {panel: this,
                        curs: currents,
                        cidx: c,
                        _: _
                        };
                promises.push(new Promise(_.bind(function(resolve, reject){
                    var scenePrims = this.panel.currentMap.viewer.scene.primitives;
                    var cur_id, cur;
                    cur = this.curs[this.cidx];
                    cur_id = cur.get('id');
                    for(var i = 0; i < scenePrims.length; i++) {
                        if (scenePrims._primitives[i].id === cur_id) {
                            this.panel.currentPrims[cur_id] = scenePrims._primitives[i];
                            if (i > 0) {
                                this.panel.currentPrims[cur_id].show = false;
                            } else {
                                this.panel.currentPrims[cur_id].show = true;
                            }
                            break;
                        }
                    }
                    if (this._.isUndefined(this.panel.currentPrims[cur_id])) {
                        cur.getGrid().then(this._.bind(function(data){
                            var newPrim = this.curs[this.cidx].processLines(data, false, this.panel.currentMap.viewer.scene.primitives);
                            newPrim.id = this.curs[this.cidx].get('id');
                            newPrim.show = false;
                            this.panel.currentPrims[cur_id] = newPrim;
                            resolve(newPrim);
                        }, this)).catch(reject); //this == ctxt
                    } else {
                        resolve(this.panel.currentPrims[cur_id]);
                    }
                }, ctxt)));
            }
            this._loadPrimitivesPromise = Promise.all(promises);
            return this._loadPrimitivesPromise;
        },

        getForm: function(obj_type) {
            return _.has(this.forms, obj_type) ? this.forms[obj_type] : GridMoverForm;
        },

        delete: function(e) {
            e.stopPropagation();

            var id = this.getID(e);
            var spill = webgnome.model.get('movers').get(id);

            swal({
                title: 'Delete "' + spill.get('name') + '"',
                text: 'Are you sure you want to delete this current?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed) {
                if (isConfirmed) {
                    var mov = webgnome.model.get('movers').get(id);
                    var envs = webgnome.model.get('environment');

                    if (mov.get('obj_type') === 'gnome.movers.py_current_movers.PyCurrentMover') {
                        var env_id = mov.get('current').id;

                        for (var i = 0; i < envs.length; i++) {
                            if (envs.models [i].id === env_id) {
                                envs.remove(env_id);
                            }
                        }
                    }

                    webgnome.model.get('movers').remove(id);

                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },

        close: function() {
            if (this.currentMap) {
                this.currentMap.close();
            }

            BasePanel.prototype.close.call(this);
        }

    });

    return currentPanel;
});
