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
    'views/modal/loading',
    'views/form/cats'
], function($, _, Backbone, DefaultWizard, GnomeModel,
    GnomeLocation, GnomeWind, GnomeWindMover,
    TextForm, ModelForm, WindForm, LoadingModal, CatsForm){
    var locationWizardView = DefaultWizard.extend({
        steps: [],
        initialize: function(opts){
            // Using local variable "that" to save local context (could probably used bind)
            var that = this;
            // Initializes loading modal upon location wizard's initialization
            // and calls render on it so it appears to the user
            this.loadingGif = new LoadingModal();
            this.loadingGif.render();
            this.location = new GnomeLocation({id: opts.slug});
            this.name = opts.name;
            this.location.fetch({
                success: _.bind(this.found, this),
                error: _.bind(this.notfound, this)
            });
        },

        found: function(){
            // Using local variable "that" to save local context (could probably used bind)
            var that = this;  
            webgnome.model = new GnomeModel();
            webgnome.model.fetch({
                success: _.bind(this.loaded, this),
                error: _.bind(this.failed_load, this)
            });
        },

        failed_load: function(){
            console.log('Location model failed to load');
            alert('Location model failed to load.');
            this.loadingGif.hide();
        },

        loaded: function(){

            // clear any previously loaded steps
            _.each(this.steps, function(el, ind, ar){
                el.close();
            });
            this.steps = [];
            this.loadingGif.hide();

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el, ind, ar){
                var title = [];
                title[0] = el.title;
                title[1] = '<span class="sub-title">' + this.name + '</span>';
                
                if(el.type == 'text' || el.type == 'welcome'){
                    if(!el.title){
                        title[0] = 'Welcome';
                    }
                    this.steps.push(new TextForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }));
                } else if (el.type == 'model') {
                    this.steps.push(new ModelForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }, webgnome.model));
                } else if (el.type == 'wind') {
                    if(!el.title){
                        title[0] = 'Wind';
                    }
                    var wind = new GnomeWind();
                    wind.save(null, {
                        success: function(){
                            webgnome.model.get('environment').add(wind);
                            var windMover = new GnomeWindMover({wind: wind});
                            windMover.save(null, {
                                success: function(){
                                    webgnome.model.get('movers').add(windMover);
                                    webgnome.model.save();
                                }
                            });
                        }
                    });

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
            this.loadingGif.hide();
        }
    });

    return locationWizardView;
});