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
    'views/default/footer'
], function($, _, Backbone,
    IndexView, MenuView, NotFoundView, LocationsView, SetupView, ModelView, TestView, AdiosView, OverviewView, FAQView, FooterView) {
    var Router = Backbone.Router.extend({
        views: [],
        name: 'Main',
        routes: {
            '': 'index',
            'locations': 'locations',
            'setup': 'setup',
            'model': 'model',
            'overview': 'overview',
            'faq': 'faq',
            'faq/:title': 'faq',

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

        setup: function(){
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
                this.navigate('setup', true);
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

        notfound: function(actions){
            this.views.push(new MenuView());
            this.views.push(new NotFoundView());
            console.log('Not found:', actions);
        }
    });

    return Router;
});
