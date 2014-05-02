define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/default/menu.html',
    'views/modal/about',
    'lib/bootstrap.min'
 ], function($, _, Backbone, MenuTemplate, AboutModal) {
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
        },

        events: {
            'click .navbar-brand': 'newModel',
            'click .new': 'newModel',
            'click .load': 'load',
            'click .locations': 'locations',
            'click .save': 'save',
            'click .preferences': 'preferences',

            'click .run': 'run',
            'click .step': 'step',
            'click .rununtil': 'rununtil',

            'click .about': 'about',
            'click .tutorial': 'tutorial'
        },

        nothing: function(event){
            event.preventDefault();
        },

        newModel: function(event){
            event.preventDefault();
            webgnome.router.navigate('', true);
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
            webgnome.router.navigate('save', true);
        },

        preferences: function(event){
            event.preventDefault();
            webgnome.router.navigate('preferences', true);
        },

        run: function(event){

        },

        step: function(event){

        },

        rununtil: function(event){

        },

        about: function(event){
            event.preventDefault();
            new AboutModal();
        },

        tutorial: function(event){

        },

        enableMenuItem: function(item){
            this.$el.find('.' + item).show();
        },

        disableMenuItem: function(item){
            this.$el.find('.' + item).hide();
        },

        contextualize: function(){
            if(!webgnome.hasModel()){
                this.disableMenuItem('actions');
                this.disableMenuItem('save');
                
            }
        },

        render: function(){
            var compiled = _.template(MenuTemplate);
            $('body').append(this.$el.html(compiled));
            this.$('a').tooltip({
                placement: 'right',
                container: 'body'
            });
        }
    });

    return menuView;
});