define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/default',
    'model/gnome',
    'model/location',
    'model/environment/wind',
    'model/movers/wind',
    'views/form/text',
    'views/form/model',
    'views/form/wind',
], function($, _, Backbone, DefaultWizard, GnomeModel,
    GnomeLocation, GnomeWind, GnomeWindMover,
    TextForm, ModelForm, WindForm){
    var locationWizardView = DefaultWizard.extend({
        steps: [],

        initialize: function(opts){
            webgnome.model = new GnomeModel();
            webgnome.model.save(null, {validate: false});
            webgnome.model.once('ready', _.bind(function(){
                this.location = new GnomeLocation({id: opts.slug});
                this.name = opts.name;
                this.location.fetch({
                    success: _.bind(this.found, this),
                    error: this.notfound
                });
            }, this));
            
        },

        found: function(){
            // clear any previously loaded steps
            _.each(this.steps, function(el, ind, ar){
                el.close();
            });
            this.steps = [];

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el, ind, ar){
                var title = [];
                title[0] = el.title;
                title[1] = '<span class="sub-title">' + this.name + '</span>';
                
                if(ind == 'text' || ind == 'welcome'){
                    if(!el.title){
                        title[0] = 'Welcome';
                    }
                    this.steps.push(new TextForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }));
                } else if (ind == 'model') {
                    this.steps.push(new ModelForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }, webgnome.model));
                } else if (ind == 'wind') {
                    if(!el.title){
                        title[0] = 'Wind';
                    }
                    var wind = new GnomeWind();
                    var windMover = new GnomeWindMover({wind: wind});
                    webgnome.model.get('environment').add(wind);
                    webgnome.model.get('movers').add(windMover);
                    this.steps.push(new WindForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }, wind));
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