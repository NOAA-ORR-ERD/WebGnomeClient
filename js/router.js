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
    'views/default/adios',
    'views/model/trajectory',
    'views/model/fate',
    'views/default/overview',
    'views/default/faq',
    'views/default/load',
    'views/default/footer',
    'views/default/logger',
], function($, _, Backbone,
    IndexView, MenuView, NotFoundView, LocationsView, SetupView, ModelView, AdiosView, TrajectoryView, FateView, OverviewView, FAQView, LoadView, FooterView, LoggerView) {
    'use strict';
    var Router = Backbone.Router.extend({
        views: [],
        name: 'Main',
        routes: {
            '': 'index',
            'locations': 'locations',
            'config': 'config',
            'adios': 'adios',
            'model': 'model',
            'trajectory': 'trajectory',
            'fate': 'fate',
            'overview': 'overview',
            'faq': 'faq',
            'faq/:title': 'faq',
            'load': 'load',

            '*actions': 'notfound'
        },

        execute: function(callback, args){
            for(var view in this.views){
                $('.tooltip').remove();
                this.views[view].close();
            }
            this.views = [];
            if(callback){ callback.apply(this, args); }
            if(window.location.href.indexOf('trajectory') === -1 || webgnome.model.get('mode') === 'adios'){
                this.views.push(new FooterView());
            }
            if(_.isUndefined(this.logger) && window.location.hash !== ''){
                this.logger = new LoggerView();
            } else if(this.logger && window.location.hash === ''){
                this.logger.close();
                this.logger = undefined;
            }
        },

        index: function(){
            this.menu('remove');
            this.views.push(new IndexView());
        },

        config: function(){
            this.menu('add');
            this.views.push(new SetupView());
        },

        locations: function(){
            this.menu('add');
            this.views.push(new LocationsView());
        },

        adios: function(){
            if(webgnome.hasModel()){
                this.menu('add');
                this.views.push(new AdiosView());
            } else {
                this.navigate('', true);
            }
        },

        model: function(){
            if(webgnome.hasModel()){
                this.menu('add');
                this.views.push(new ModelView());
            } else {
                this.navigate('', true);
            }
        },

        trajectory: function(){
            this.menu('add');
            this.views.push(new TrajectoryView());
            localStorage.setItem('view', 'trajectory');
        },

        fate: function(){
            this.menu('add');
            this.views.push(new FateView());
            localStorage.setItem('view', 'fate');
        },

        overview: function(){
            this.menu('add');
            this.views.push(new OverviewView());
        },

        faq: function(title){
            this.menu('add');
            if (!_.isUndefined(title)){
                this.views.push(new FAQView({topic: title}));
            } else {
                this.views.push(new FAQView());
            }
        },

        load: function(){
            this.menu('add');
            this.views.push(new LoadView());
        },

        notfound: function(actions){
            this.menu('add');
            this.views.push(new NotFoundView());
            console.log('Not found:', actions);
        },

        menu: function(action){
            switch (action){
                case 'add':
                    if (!this.menuView) {
                        this.menuView = new MenuView();
                    }
                    break;
                case 'remove':
                    if (this.menuView) {
                        this.menuView.remove();
                        delete this.menuView;
                    }
                    break;
            }
        }
    });

    return Router;
});
