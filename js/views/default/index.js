define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/swal',
    'views/default/load',
    'text!templates/default/index.html',
    'views/wizard/adios',
    'views/wizard/gnome',
    'model/gnome',
    'views/form/mover/goods',
    'views/form/spill/type',
    'views/form/water'
], function($, _, Backbone, swal, LoadView, IndexTemplate, AdiosWizard, GnomeWizard,  GnomeModel, GoodsMoverForm, SpillTypeForm, WaterForm){
    'use strict';
    var indexView = Backbone.View.extend({
        className: 'page home',

        events: {
            'click .advanced': 'setup',
            'click .location': 'location',
            'click .adios-wizard': 'adios',
            'click .gnome-wizard': 'gnome',
            'click .doc': 'doc',
            'click .roc': 'roc',
            'click .oillib': 'oillib',
            'click .ofs': 'ofs',
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var tmpl = _.template(IndexTemplate);
            var compiled = tmpl();
            $('body').append(this.$el.append(compiled));
            this.load = new LoadView({simple: true, page: false, el: this.$('.load')});
        },

        setup: function(e){ 
            e.preventDefault();
            if (webgnome.hasModel()){
                swal.fire({
                    title: 'Previous Model Setup Found',
                    text:'Choose to continue with your previous scenario or start setting up a new model.',
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Continue Previous',
                    confirmButtonText: 'New Model',
                    reverseButtons: true
                }).then(_.bind(function(continuePrevious) {
                    if (continuePrevious.isConfirmed) {
                        webgnome.model = new GnomeModel({
                            mode: 'gnome',
                            name: 'Model',
                        });
                        webgnome.router.navigate('config', true);
                    } else {
                        webgnome.model.save(null, {
                            validate: false, 
                        });
                        webgnome.router.navigate('config', true);
                    }
                }, this));        
            } else {
                webgnome.router.navigate('config', true);
            }
        },

        ofs: function(e) {
            e.preventDefault();
            webgnome.model = new GnomeModel({
                name: 'Model',
                mode: 'gnome'
            });
            var subsetStep = new GoodsMoverForm({
                size: 'xl',
                request_type: 'currents',
                wizard: true,
            });
            var windStep = new WindTypeForm();
            var spillStep = new SpillTypeForm();
            var waterStep = new WaterForm();
            subsetStep.render();
            webgnome.model.save(null, {
                validate: false,
                success: _.bind(function(){
                    this.listenToOnce(subsetStep, 'success', _.bind(function(reqObj){
                        if (!reqObj.request_type.includes('surface winds')){
                            windStep.render();
                            spillStep.listenToOnce(windStep,)
                        }
                    }, this))
                    spillStep.listenToOnce(spillStep, 'hidden', _.bind(spillStep.close, spillStep));
                    spillStep.listenToOnce(webgnome.model, 'change:map', _.bind(spillStep.render, spillStep));
                    waterStep.listenToOnce(webgnome.model.get('spills'), 'add', _.bind(function(spill){
                        if (spill.get('substance').get('is_weatherable')){
                            waterStep.render();
                        } else {
                            this.trigger('setup_complete');
                        }
                    }, this));
                    this.listenToOnce(waterStep, 'hidden', _.bind(function(){
                        this.trigger('setup_complete');
                        webgnome.model.get('environment').add(waterStep.model, {merge:true});
                        webgnome.model.save(null, {validate: false});
                    }, this));
                    this.listenToOnce(this, 'setup_complete', function(){
                        webgnome.router.navigate('config', true);
                        if ($('body').hasClass('modal-open')){
                            $('body').removeClass('modal-open');
                        }
                    });


                }, this)
            });
        },  
        
        // setup: function(e) {
            // e.preventDefault();

            // if(webgnome.hasModel()){
                // webgnome.model.set('mode', 'gnome');
                // webgnome.model.save({'name': 'Model'});
            // } else {
                // webgnome.router._cleanup();
            // }

            // webgnome.router.navigate('config', true);
        // },

        location: function(e){
            e.preventDefault();
            webgnome.router.navigate('locations', true);
        },
        
        oillib: function(e){
            window.open('https://adios.orr.noaa.gov', '_blank');
        },

        roc: function(e){
            e.preventDefault();
            webgnome.model = new GnomeModel({
                name: 'ROC Model_',
                duration: 432000,
                time_step: 900,
                mode: 'roc'
            });
            webgnome.model.save(null, {
                validate: false,
                success: function(){
                    webgnome.router.navigate('roc', true);
                }
            });
        },

        adios: function(e){
            e.preventDefault();
            webgnome.model = new GnomeModel({
                name: 'ADIOS Model_',
                duration: 432000,
                time_step: 900,
                mode: 'adios'
            });
            webgnome.model.save(null, {
                validate: false,
                success: function(){
                    webgnome.router.navigate('adios', true);
                }
            });
            localStorage.setItem('view', 'fate');
        },

        gnome: function(e){
            e.preventDefault();
            var wiz = new GnomeWizard();
        },

        doc: function(event){
            event.preventDefault();
            window.open("doc/");
        },

        close: function(){
            this.load.close();
            Backbone.View.prototype.close.call(this);
        }
    });

    return indexView;
});
