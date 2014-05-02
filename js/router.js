define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/menu',
    'views/default/index',
    'views/default/notfound',
    'views/location/index',
    'views/model/index'
], function($, _, Backbone, MenuView, IndexView, NotFoundView, LocationsView, ModelView) {
    var Router = Backbone.Router.extend({
        views: [],
        name: 'Main',
        routes: {
            '': 'index',
            'model': 'model',
            'locations': 'locations',
            'wind/:id': 'wind',
            'spill/:id': 'spill',
            '*actions': 'notfound'
        },
        execute: function(callback, args){
            for(var view in this.views){
                $('.tooltip').remove();
                this.views[view].close();
            }
            if(callback) callback.apply(this, args);
        },

        index: function(){
            this.views.push(new MenuView());
            this.views.push(new IndexView());
        },

        notfound: function(actions){
            this.views.push(new MenuView());
            this.views.push(new NotFoundView());
            console.log('Not found:', actions);
        },

        locations: function(){
            this.views.push(new MenuView());
            this.views.push(new LocationsView());
        },

        model: function(){
            this.views.push(new MenuView());
            this.views.push(new ModelView());
        }

    });

    // var initialize = function(){
    //     var router = new Router();
    //     router.on('route:index', function(){
    //         // if there's a uuid cookie set then route to the model view
    //         // else stay here and serve the landing page view
    //         if (verifyUUID()){
    //             if(hasModel()){
    //                 // don't push state this redirection as it's possible to have an entry point
    //                 // straight to the model view as well as the landing page.
    //                 this.navigate('model', {trigger: true, replace: true});
    //             }
    //             // setup a uuid/handshake with the server
    //             if(!serverHandshake()){
    //                 // return error page that something is wrong with internet/server
    //             }
    //         }

    //         var menuView = new MenuView();
    //         var indexView = new IndexView();
    //     });

    //     router.on('model', function(){
    //         if (!this.appView.sbUncollapsedWidth) {
    //             this.appView.disableFullscreen();
    //         }
    //         this.newModel = false;
    //         this.appView.showSection('model');
    //     });

    //     router.on('splash', function(){
    //         if (!this.newModel) {
    //             return this.navigate('model', true);
    //         }

    //         return this.appView.showSection('splash-page');
    //     });

    //     router.on('showForm', function(){
    //         this.appView.disableFullscreen();
    //         this.appView.showSection('model');
    //         this.appView.formViews.hideAll();
    //         var formView = this.appView.formViews.get(formId);
    //         formView.reload(objectId);
    //         formView.show();
    //     });

    //     router.on('wind', function(id){
    //         var formId;

    //         if (id === 'new') {
    //             id = null;
    //             formId = 'add-wind';
    //         } else {
    //             formId = 'edit-wind';
    //         }
    //         this.showForm(formId, id);
    //     });

    //     router.on('spill', function(id){
    //         var formId;

    //         if (id === 'new') {
    //             id = null;
    //             formId = 'add-surface-release-spill';
    //         } else {
    //             formId = 'edit-surface-release-spill';
    //         }
    //         this.showForm(formId, id);
    //     });

    // };

    var serverHandshake = function(){
        // try to setup a uuid via a handshake request to the server.
        // return true if successful
        // return false if 401 or no response
        return true;
    };

    var hasModel = function(){
        // check if the uuid has a model on the server.
        return false;
    };

    var verifyUUID = function(){
        // check if the client has a cookie set with a valid uuid
        // if exists and is valid return true
        // else return false

        var uuid = '';
        if (uuid){
            return true;
        }
        return false;
    };

    return Router;
});
