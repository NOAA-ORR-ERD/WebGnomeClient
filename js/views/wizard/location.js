define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/default',
    'model/gnome',
    'model/location',
    'views/form/text',
    'views/form/model'
], function($, _, Backbone, DefaultWizard, GnomeModel, GnomeLocation, TextForm, ModelForm){
    var locationWizardView = DefaultWizard.extend({
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
            // clear any previously loaded steps
            _.each(this.steps, function(el, ind, ar){
                el.close();
            });
            this.steps = [];

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
                } else if (ind == 'model') {
                    this.steps.push(new ModelForm({
                        name: el.name,
                        title: el.title,
                        body: el.body,
                        buttons: el.buttons
                    }, this.model));
                }


            }, this));

            this.start();
        },

        notfound: function(){
            console.log('location was not found');
            alert('There was not a location found with that id.');
        }
    });

    return locationWizardView;
});