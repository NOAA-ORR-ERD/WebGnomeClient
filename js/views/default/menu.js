define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/menu.html',
    'views/modal/about',
    'views/modal/hotkeys',
    'views/form/location',
    'views/form/outputter/netcdf',
    'views/form/outputter/kmz',
    'views/form/outputter/shape',
    'sweetalert',
    'model/gnome',
    'bootstrap'
 ], function($, _, Backbone, MenuTemplate, AboutModal, HotkeysModal, LocationForm, NetCDFForm, KMZForm, ShapeForm, swal, GnomeModel) {
    'use strict';
    /*
        `MenuView` handles the drop-down menus on the top of the page. The object
        listens for click events on menu items and fires specialized events, like
        RUN_ITEM_CLICKED, which an `AppView` object listens for.

        Most of these functions exist elsewhere in the application and `AppView`
        calls the appropriate method for whatever functionality the user invoked.
     */

    var menuView = Backbone.View.extend({
        tagName: 'nav',
        className: 'navbar navbar-default navbar-fixed-top',

        initialize: function() {
            this.render();
            this.contextualize();
            // webgnome.model.on('change', this.contextualize, this);
            webgnome.cache.on('reset', this.contextualize, this);
            this.listenTo(webgnome.router, 'route', this.contextualize);

            if(!localStorage.getItem('view')){
                localStorage.setItem('view', 'trajectory');
            }
        },

        events: {
            // 'click .navbar-brand': 'home',
            //'click .new': 'newModel',
            'click .edit': 'editModel',
            'click .load': 'load',
            'click .locations': 'locations',
            'click .save': 'save',
            'click a.debugView': 'debugView',

            'click .run': 'run',
            'click .rewind': 'rewind',
            // 'click .step': 'step',
            // 'click .rununtil': 'rununtil',
            'click .netcdf': 'netcdf',
            'click .kmz': 'kmz',
            'click .shape': 'shape',

            'click .about': 'about',
            'click .doc': 'doc',
            'click .faq': 'faq',
            'click .hotkeys': 'hotkeys',

            'click .gnome': 'gnome',
            'click .adios': 'adios',
            'click .setup': 'setup',
            'click .home': 'home',

            'click .app-menu-link': 'openAppMenu',
            'click .app-menu-close': 'closeAppMenu',

            'click .view-toggle .view': 'toggleView'
        },

        toggleView: function(e){
            if(_.isObject(e)){
                var view = this.$(e.target).attr('class').replace('view ', '');
                this.$('.view-toggle .switch').attr('class', 'switch ' + view);

                webgnome.router.navigate(view, true);
            } else {
                this.$('.view-toggle .switch').attr('class', 'switch ' + e);
            }

        },

        openAppMenu: function(event){
            event.preventDefault();
            this.$('.app-menu').addClass('open');
            this.$('.app-menu-close').addClass('open');
            this.$('.app-menu').focus();
        },

        closeAppMenu: function(){
            this.$('.app-menu').removeClass('open');
            this.$('.app-menu-close').removeClass('open');
        },

        gnome: function(event){
            event.preventDefault();
            webgnome.router.navigate('gnome/', true);
        },

        nothing: function(event){
            event.preventDefault();
        },

        home: function(event){
            event.preventDefault();
            webgnome.router.navigate('', true);
        },

        run: function(){
            localStorage.setItem('autorun', true);
            var view = localStorage.getItem('view');
            webgnome.router.navigate(view, true);
        },

        rewind: function(){
            webgnome.cache.rewind();
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

        resetModel: function(cb){
            swal({
                title: 'Create New Model?',
                text:'This action will delete all data related to any previous model setup.',
                type: 'warning',
                showCancelButton: true,
                reverseButtons: true
            }).then(_.bind(function(isConfirm){
                if(isConfirm){
                    localStorage.setItem('prediction', null);
                    if (!_.isUndefined(webgnome.riskCalc)) {
                        webgnome.riskCalc.destroy();
                    }
                    webgnome.riskCalc = undefined;

                    if(_.has(webgnome, 'cache')){
                        webgnome.cache.rewind();
                    }
                    this.contextualize();
                    cb();                                                 
                }
            }, this));
        },

        editModel: function(event){
            event.preventDefault();
            webgnome.router.navigate('config', true);
        },

        load: function(event){
            event.preventDefault();
            this.resetModel(function(){
                webgnome.router.navigate('load', true);
                });
        },

        locations: function(event){
            event.preventDefault();
            this.resetModel(function(){
                webgnome.router.navigate('locations', true);
                });
        },

        adios: function(event){
            event.preventDefault();
            this.resetModel(function(){
                webgnome.model = new GnomeModel({
                    name: 'ADIOS Model_',
                    duration: 432000,
                    time_step: 3600,
                    mode: 'adios'
                });
                webgnome.model.save(null, {
                    validate: false,
                    success: function(){
                        webgnome.router.navigate('adios', true);
                    }
                });
                localStorage.setItem('view', 'fate');
            });
        },

        setup: function(event){ 
            event.preventDefault();
            this.resetModel(function(){
                webgnome.model = new GnomeModel({
                    mode: 'gnome',
                    name: 'Model',
                });
                webgnome.model.save(null, {
                    validate: false,
                    success: function(){
                        webgnome.router.navigate('config', true);
                    }
                });
                if (window.location.href.indexOf('config') !== -1) {
                    window.location.reload();
                }
                localStorage.setItem('view', 'trajectory');
            });
        },

        save: function(event){
            event.preventDefault();
            window.location.href = webgnome.config.api + '/download';
        },

        debugView: function(event){
            event.preventDefault();
            var checkbox = this.$('input[type="checkbox"]');
            if (checkbox.prop('checked')) {
                checkbox.prop('checked', false);
            } else {
                checkbox.prop('checked', true);
                //this.trigger('debugTreeOn');
            }
            this.trigger('debugTreeToggle');
        },

        about: function(event){
            event.preventDefault();
            new AboutModal().render();
        },

        doc: function(event){
            event.preventDefault();
            window.open("doc/");
        },

        faq: function(event){
            event.preventDefault();
            window.open("#faq");
            //webgnome.router.navigate('faq', true);
        },

        hotkeys: function(event){
            event.preventDefault();
            new HotkeysModal().render();
        },

        enableMenuItem: function(item){
            this.$el.find('.' + item).show();
        },

        disableMenuItem: function(item){
            this.$el.find('.' + item).hide();
        },

        contextualize: function(){
            this.enableMenuItem('save');
            this.enableMenuItem('edit');

            if(webgnome.cache.length > 0){
                this.enableMenuItem('rewind');
            } else {
                this.disableMenuItem('rewind');
            }

            if(window.location.href.indexOf('trajectory') !== -1){
                this.disableMenuItem('run');
                this.disableMenuItem('rewind');
                this.toggleView('trajectory');
            } else if(window.location.href.indexOf('fate') !== -1) {
                this.disableMenuItem('run');
            } else {
                this.enableMenuItem('run');
            }

            if(window.location.href.indexOf('load') !== -1 || window.location.href.indexOf('location') !== -1){
                this.disableMenuItem('run');
                this.disableMenuItem('view-toggle');
            } else {
                this.enableMenuItem('view-toggle');
            }

            if(window.location.href.indexOf('fate') !== -1){
                this.toggleView('fate');
            }

            if (window.location.href.indexOf('config') !== -1) {
                this.toggleView('config');
            }

            if(window.location.href.indexOf('adios') !== -1){
                this.toggleView('config');
            }

            if (window.location.href.indexOf('response') !== -1){
                this.toggleView('response');
            }
            
        },

        render: function(){
            var compiled = _.template(MenuTemplate);
            $('body').append(this.$el.html(compiled));
            this.$('a').tooltip({
                placement: 'right',
                container: 'body'
            });
        },

        close: function(){
            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();

            Backbone.View.prototype.close.call(this);
        }
    });

    return menuView;
});
