define([
    'jquery',
    'underscore',
    'backbone',
    'model/gnome',
    'model/location'
], function($, _, Backbone, GnomeModel, GnomeLocation){
    var locationWizardView = Backbone.View.extend({
        steps: [],

        initialize: function(slug){
            this.model = new GnomeModel();
            this.location = new GnomeLocation();
            this.location.set('id', slug);
            this.location.fetch({
                success: this.found,
                error: this.notfound
            });
        },

        found: function(){
            // set up each step described in the location file.
            this.location.get('steps').forEach(_.bind(function(el, ind, ar){
                if(ind == 'text' || ind == 'welcome'){
                    define([
                        'views/form/text'
                    ], _.bind(function(TextForm){
                        this.steps.push(TestForm({
                            name: el.name,
                            title: el.title,
                            body: el.body,
                            buttons: el.buttons
                        }));
                    }, this));
                }
            }, this));
        },

        notfound: function(){
            console.log('location was not found');
            alert('There was not a location found with that id.');
        }
    });

    return locationWizardView;
});