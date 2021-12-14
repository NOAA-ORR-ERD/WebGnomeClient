define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'toastr',
    'text!templates/default/menu.html',
    'views/modal/about',
    'views/modal/changeLog',
    'views/modal/hotkeys',
    'views/model/persist_model_modal',
    'views/form/location',
    'views/form/outputter/netcdf',
    'views/form/outputter/kmz',
    'views/form/outputter/shape',
    'views/form/outputter/binary',
    'views/form/outputter/export',
    'model/gnome',
    'views/cesium/cesium',
    'bootstrap'
 ], function($, _, Backbone, swal, toastr,
             MenuTemplate, AboutModal, ChangeLogModal, HotkeysModal, PersistModelModal,
             LocationForm, NetCDFForm, KMZForm, ShapeForm, BinaryForm, ExportModal, GnomeModel, CesiumView) {
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
            webgnome.cache.on('rewind', this.contextualize, this);
            this.listenTo(webgnome.router, 'route', this.contextualize);

            if(!localStorage.getItem('view')){
                localStorage.setItem('view', 'trajectory');
            }
        },

        events: {
            'click .navbar-brand': 'home',
            
            // "New" menu
            'click .locations': 'locations',
            'click .adios': 'adios',
            'click .setup': 'setup',
            'click .load': 'load',
             
            // "Save" optional menu items
            'click .save': 'save',
            'click .persist': 'persist_modal',
                //export menu
                'click .export': 'export',

            // "Help" menu
            'click .about': 'about',
            'click .changeLog': 'changeLog',
            'click .doc': 'doc',
            'click .faq': 'faq',
            'click .hotkeys': 'hotkeys',
            'click .toggleLogger': 'toggleLogger',

            // "Views" & slider
            'click .view-menu .view': 'toggleView',
            'click .view-toggle .view': 'toggleView'
        },

        nothing: function(event){
            event.preventDefault();
        },

        // WebGNOME Logo
        home: function(event){
            event.preventDefault();
            this.resetModel(function(){
                webgnome.model = new GnomeModel({
                    mode: 'gnome',
                    name: 'Model',
                });
                webgnome.router.navigate('', true);
                });
        },

        // begin 'New' menu
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
                    duration: 259200,
                    time_step: 900,
                    mode: 'adios'
                });
                webgnome.model.save(null, {
                    validate: false,
                    success: function(){
                        localStorage.setItem('view', 'fate');
                        if (window.location.href.indexOf('adios') !== -1) {
                            window.location.reload();
                        } else {
                            webgnome.router.navigate('adios', true);
                        }
                    }
                });
                
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
                        localStorage.setItem('view', 'trajectory');
                        if (window.location.href.indexOf('config') !== -1) {
                            window.location.reload();
                        } else {
                            webgnome.router.navigate('config', true);
                        }
                     }
                });
                
            });
        },

        load: function(event){
            event.preventDefault();
            this.resetModel(function(){
                webgnome.router.navigate('load', true);
            });
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
                        webgnome.router._cleanup();
                        CesiumView._cleanup();

                    }                    
                    this.contextualize();
                    cb();                                                 
                }
            }, this));
        },
        // end 'New' menu

        // begin Save menu
        save: function(event){
            event.preventDefault();
            webgnome.cache.rewind();
            window.location.href = webgnome.config.api + '/download';
        },

        persist_modal: function(event) {
            event.preventDefault();
            this.modelFileName = webgnome.model.attributes.name;
            this.persistModelView = new PersistModelModal({}, this.modelFileName);
            this.persistModelView.render();
            this.persistModelView.once('save', _.bind(this.persist, this));
        },

        persist: function(event){
            var modelFileName = this.persistModelView.modelFileName;
            console.log('Save the model on server as ' + modelFileName);

            webgnome.cache.rewind();

            $.post('/persist', {'name': modelFileName})
            .done(function(response){
                toastr.success('Model saved.', 'Success!', {timeOut: 3000});
            })
            .fail(function(response) {
                toastr.error('Model was not saved. Return: ' + response,
                             'Failed!',
                             {timeOut: 3000});
            });
        },

        export: function(event) {
            event.preventDefault();
            var exportForm = new ExportModal();
            exportForm.render();

            exportForm.on('hide', _.bind(function(model){
                exportForm.close();
            }, this));
        },
        // end Save menu

        // begin Help menu
        about: function(event){
            event.preventDefault();
            new AboutModal().render();
        },
        
        changeLog: function(event){
            event.preventDefault();
            new ChangeLogModal().render();
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

        toggleLogger: function(event){
            event.preventDefault();
            $('.logger > .toggle').toggle();
            if ($('body').hasClass('logger-open')){
                webgnome.router.logger.toggle(true);
            }
        },
        //end Help menu

        enableMenuItem: function(item){
            this.$el.find('.' + item).show();
        },

        disableMenuItem: function(item){
            this.$el.find('.' + item).hide();
        },

        contextualize: function(){
            this.enableMenuItem('save');
            this.enableMenuItem('edit');

            if(webgnome.cache && webgnome.cache.length > 0){
                this.enableMenuItem('rewind');
            } else {
                this.disableMenuItem('rewind');
            }

            //handles switching the view-toggle slider depending on the page you're on, or disabling it if you're on load/location
            this.enableMenuItem('views');
            this.enableMenuItem('view-toggle');
            if(window.location.href.indexOf('trajectory') !== -1){
                this.toggleView('trajectory');
            } else if(window.location.href.indexOf('fate') !== -1) {
                this.toggleView('fate');
            } else if (window.location.href.indexOf('config') !== -1) {
                this.toggleView('config');
            } else if(window.location.href.indexOf('adios') !== -1 || window.location.href.indexOf('roc') !== -1){
                this.toggleView('config');
            // } else if (window.location.href.indexOf('response') !== -1){
                // this.toggleView('response');
            // } else if (window.location.href.indexOf('model') !== -1){
                // this.toggleView('model');
            } else {
                this.toggleView('model'); 
                //this is a punt as the "model" switch is no longer visible, should update the CSS for a more robust fix
            }
            
            // } else if (window.location.href.indexOf('roc') !== -1){
                // this.disableMenuItem('view-toggle');
                // this.disableMenuItem('views');
            // } else if(window.location.href.indexOf('load') !== -1 || window.location.href.indexOf('location') !== -1){
                // this.disableMenuItem('view-toggle');
                // this.disableMenuItem('views');
            // } else {
                // this.enableMenuItem('views');
                // this.enableMenuItem('view-toggle');
            //}
        },

        toggleView: function(e){
            var view;
            if(_.isObject(e)){
                e.preventDefault();
                view = this.$(e.target).attr('class').replace('view ', '');
                this.$('.view-toggle .switch').attr('class', 'switch ' + view);

                webgnome.router.navigate(view, true);
            } else {
                view = e;
                this.$('.view-toggle .switch').attr('class', 'switch ' + e);
            }
            if (view !== 'trajectory' && !_.isUndefined(webgnome.router.trajView)) {
                webgnome.router.trajView.$el.hide();
            }
            this.$('.view-toggle .switch').attr('data-original-title', this.$('.view-toggle .' + view).data('original-title'));
        },

        render: function(){
            var compiled = _.template(MenuTemplate);
            $('body').append(this.$el.html(compiled({'can_persist': webgnome.config.can_persist})));

            this.$('a').tooltip({
                placement: 'right',
                container: 'body'
            });

            this.$('.view-toggle .view').tooltip({
                placement: 'bottom',
                container: 'body'
            });

            this.$('.view-toggle .switch').tooltip({
                placement: 'bottom'
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
