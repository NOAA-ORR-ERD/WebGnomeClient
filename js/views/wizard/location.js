define([
    'jquery',
    'underscore',
    'backbone',
    'model/gnome',
    'model/location',
    'views/form/text'
], function($, _, Backbone, GnomeModel, GnomeLocation, TextForm){
    var locationWizardView = Backbone.View.extend({
        steps: [],

        initialize: function(opts){
            this.model = new GnomeModel();
            this.location = new GnomeLocation({id: opts.slug});
            this.location.fetch({
                success: _.bind(this.found, this),
                error: this.notfound
            });
        },

        found: function(){
            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el, ind, ar){
                if(ind == 'text' || ind == 'welcome'){
                    if(!el.title){
                        el.title = 'Welcome';
                    }
                    this.steps.push(new TextForm({
                        name: el.name,
                        title: el.title,
                        body: el.body,
                        buttons: el.buttons
                    }));
                }
            }, this));

            console.log(this.steps);
        },

        notfound: function(){
            console.log('location was not found');
            alert('There was not a location found with that id.');
        }
    });

    return locationWizardView;
});