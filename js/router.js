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
    'views/tests/index',
    'views/default/adios',
    'views/default/overview',
    'views/default/faq',
    'views/default/load',
    'views/default/footer'
], function($, _, Backbone,
    IndexView, MenuView, NotFoundView, LocationsView, SetupView, ModelView, TestView, AdiosView, OverviewView, FAQView, LoadView, FooterView) {
    var Router = Backbone.Router.extend({
        views: [],
        name: 'Main',
        routes: {
            '': 'index',
            'locations': 'locations',
            'config': 'config',
            'model': 'model',
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
            if(callback) callback.apply(this, args);
            if(window.location.href.indexOf('test.html') === -1){
                this.views.push(new FooterView());
            }
        },

        index: function(){
            if (window.location.href.indexOf('test.html') != -1){
                this.views.push(new TestView());
            } else {
                this.views.push(new IndexView());
            }
        },

        config: function(){
            this.views.push(new MenuView());
            this.views.push(new SetupView());
        },

        locations: function(){
            this.views.push(new MenuView());
            this.views.push(new LocationsView());
        },

        model: function(){
            if(webgnome.hasModel()){
                this.views.push(new MenuView());
                this.views.push(new ModelView());
            } else {
                this.navigate('config', true);
            }
        },

        overview: function(){
            this.views.push(new MenuView());
            this.views.push(new OverviewView());
        },

        faq: function(title){
            this.views.push(new MenuView());
            if (!_.isUndefined(title)){
                this.views.push(new FAQView({topic: title}));
            } else {
                this.views.push(new FAQView());
            }
        },

        load: function(){
            this.views.push(new MenuView());
            this.views.push(new LoadView());
        },

        notfound: function(actions){
            this.views.push(new MenuView());
            this.views.push(new NotFoundView());
            console.log('Not found:', actions);
        }
    });

    return Router;
});
