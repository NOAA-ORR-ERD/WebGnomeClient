define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/index',
    'views/default/menu',
    'views/default/notfound',
    'views/location/index',
    'views/model/setup',
    'views/model/index',
    'views/model/response/index',
    'views/default/adios',
    'views/default/roc',
    'views/model/trajectory/index',
    'views/model/fate/fate',
    'views/default/faq',
    'views/default/load',
    'views/default/footer',
    'views/default/logger',
], function($, _, Backbone,
            IndexView, MenuView, NotFoundView, LocationsView,
            SetupView, ModelView, ResponseView, AdiosView, RocView,
            TrajectoryView, FateView, FAQView,
            LoadView, FooterView, LoggerView) {
    'use strict';
    var Router = Backbone.Router.extend({
        views: [],
        name: 'Main',
        routes: {
            '': 'index',
            'locations': 'locations',
            'config': 'config',
            'adios': 'adios',
            'roc': 'roc',
            'response': 'response',
            'model': 'model',
            'trajectory': 'trajectory',
            'fate': 'fate',
            'overview': 'overview',
            'faq': 'faq',
            'faq/:title': 'faq',
            'load': 'load',

            '*actions': 'notfound'
        },

        execute: function(callback, args) {
            for (var view in this.views) {
                $('.tooltip').not('.slider-tip').remove();
                this.views[view].close();
            }

            this.views = [];

            if (callback) { callback.apply(this, args); }

            if (window.location.href.indexOf('trajectory') === -1 &&
                    window.location.href.indexOf('model') === -1) {
                this.views.push(new FooterView());
            }

            if (_.isUndefined(this.logger) && window.location.hash !== '') {
                this.logger = new LoggerView();
            }
            else if (this.logger && window.location.hash === '') {
                this.logger.close();
                this.logger = undefined;
            }

            ga('send', 'pageview', location.hash);
        },

        index: function() {
            this.menu('remove');
            this.views.push(new IndexView());
            webgnome.resetSessionTimer();
        },

        config: function() {
            this.menu('add');
            this.views.push(new SetupView());
            webgnome.initSessionTimer(webgnome.continueSession);
        },

        locations: function() {
            this.menu('add');
            this.views.push(new LocationsView());
        },

        adios: function() {
            if (webgnome.hasModel()) {
                this.menu('add');
                this.views.push(new AdiosView());
            }
            else {
                this.navigate('', true);
            }
        },
        
        roc: function() {
            if (webgnome.hasModel()) {
                this.menu('add');
                this.views.push(new RocView());
            }
            else {
                this.navigate('', true);
            }

            webgnome.initSessionTimer(webgnome.continueSession);
        },

        model: function() {
            if (webgnome.hasModel()) {
                this.menu('add');
                this.views.push(new ModelView());
            }
            else {
                this.navigate('', true);
            }
        },

        response: function() {
            if (webgnome.hasModel()) {
                this.menu('add');
                this.views.push(new ResponseView());
                //localStorage.setItem('view', 'response');
            }
            else {
                this.navigate('', true);
            }
        },

        trajectory: function() {
            if (webgnome.hasModel()) {
                this.menu('add');

                if (_.isUndefined(this.trajView)) {
                    this.trajView = new TrajectoryView();
                }
                else {
                    this.trajView.show();
                }

                this.views.push(this.trajView);
                //localStorage.setItem('view', 'trajectory'); WHY??
            }
            else {
                this.navigate('', true);
            }

            webgnome.initSessionTimer(webgnome.continueSession);
        },

        fate: function() {
            if (webgnome.hasModel()) {
                this.menu('add');
                this.views.push(new FateView());
                //localStorage.setItem('view', 'fate');
            }
            else {
                this.navigate('', true);
            }

            webgnome.initSessionTimer(webgnome.continueSession);
        },

        faq: function(title) {
            this.menu('add');

            if (!_.isUndefined(title)) {
                this.views.push(new FAQView({topic: title}));
            }
            else {
                this.views.push(new FAQView());
            }
        },

        load: function() {
            this.menu('add');
            this.views.push(new LoadView());
        },

        notfound: function(actions) {
            this.menu('add');
            this.views.push(new NotFoundView());
            console.log('Not found:', actions);
        },

        menu: function(action) {
            switch (action){
                case 'add':
                    if (!this.menuView) {
                        this.menuView = new MenuView();
                    }
                    break;
                case 'remove':
                    if (this.menuView) {
                        this.menuView.close();
                        delete this.menuView;
                    }
                    break;
            }
        },
        
        _cleanup: function() {
            // Cleans up parts of the website (such as trajectory view) when necessary
            if (!_.isUndefined(webgnome.router.trajView)) {
                if (this.trajView.viewer) {
                    this.trajView.viewer.destroy();
                }
                this.trajView.stopListening();
                if (this.trajView.controls) {
                    this.trajView.controls.stopListening();
                }
                if (this.trajView.layersPanel){
                    this.trajView.layersPanel.stopListening();
                }
                this.trajView.remove();
            }
            this.trajView = undefined;
        }

    });

    return Router;
});
