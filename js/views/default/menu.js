define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/menu.html',
    'views/modal/about',
    'views/modal/hotkeys',
    'sweetalert',
    'model/gnome',
    'bootstrap'
 ], function($, _, Backbone, MenuTemplate, AboutModal, HotkeysModal, swal, GnomeModel) {
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
        className: 'navbar navbar-default',

        initialize: function() {
            this.render();
            this.contextualize();
            //webgnome.model.on('change', this.contextualize, this);
        },

        events: {
            // 'click .navbar-brand': 'home',
            'click .new': 'newModel',
            'click .edit': 'editModel',
            'click .load': 'load',
            'click .locations': 'locations',
            'click .save': 'save',
            'click a.debugView': 'debugView',

            // 'click .run': 'run',
            // 'click .step': 'step',
            // 'click .rununtil': 'rununtil',

            'click .about': 'about',
            'click .overview': 'overview',
            'click .faq': 'faq',
            'click .hotkeys': 'hotkeys',

            'click .gnome': 'gnome',
            'click .adios': 'adios',
            'click .home': 'home',

            'click .app-menu-link': 'openAppMenu',
            'click .app-menu-close': 'closeAppMenu'
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

        adios: function(event){
            event.preventDefault();
            webgnome.router.navigate('adios/', true);
        },

        nothing: function(event){
            event.preventDefault();
        },

        home: function(event){
            event.preventDefault();
            webgnome.router.navigate('', true);
        },

        newModel: function(event){
            event.preventDefault();
            swal({
                title: 'Create New Model?',
                text:'Creating a new model will delete all data related to any current model.',
                type: 'warning',
                showCancelButton: true,
            }, _.bind(function(isConfirm){
                if(isConfirm){
                    localStorage.setItem('prediction', null);
                    webgnome.model = new GnomeModel();

                    if(_.has(webgnome, 'cache')){
                        webgnome.cache.rewind();
                    }
                    webgnome.model.save(null, {
                        validate: false,
                        success: _.bind(function(){
                            this.contextualize();
                            webgnome.router.navigate('', true);
                            webgnome.router.navigate('config', true);
                        }, this)
                    });
                }
            }, this));
        },

        editModel: function(event){
            event.preventDefault();
            webgnome.router.navigate('config', true);
        },

        load: function(event){
            event.preventDefault();
            webgnome.router.navigate('load', true);
        },

        locations: function(event){
            event.preventDefault();
            webgnome.router.navigate('locations', true);
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

        overview: function(event){
            event.preventDefault();
            webgnome.router.navigate('overview', true);
        },

        faq: function(event){
            event.preventDefault();
            webgnome.router.navigate('faq', true);
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
            if(!webgnome.hasModel()){
                this.disableMenuItem('save');
            } else {
                this.enableMenuItem('save');
            }
            
            if(webgnome.hasModel()){
                this.enableMenuItem('edit');
            } else {
                this.disableMenuItem('edit');
            }

            if(window.location.href.indexOf('model') != -1){
                this.enableMenuItem('debugView');
            } else {
                this.disableMenuItem('debugView');
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