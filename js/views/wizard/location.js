define([
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/default',
    'model/gnome',
    'model/location',
    'model/environment/wind',
    'model/movers/wind',
    'model/outputters/geojson',
    'views/form/text',
    'views/form/model',
    'views/form/wind',
    'views/modal/loading'
], function($, _, Backbone, DefaultWizard, GnomeModel,
    GnomeLocation, GnomeWind, GnomeWindMover,
    GeojsonOutputter,
    TextForm, ModelForm, WindForm, LoadingModal){
    var locationWizardView = DefaultWizard.extend({
        steps: [],
        initialize: function(opts){
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
            outputter = new GeojsonOutputter();
            outputter.save(null, {
                success: _.bind(function(outputter){
                    webgnome.model.get('outputters').add(outputter);
                    webgnome.model.save(null, {
                        success: _.bind(this.load_location, this)
                    });
                }, this)
            });
        },

        load_location: function(){
            // clear any previously loaded steps
            _.each(this.steps, function(el){
                el.close();
            });
            this.steps = [];
            this.loadingGif.hide();

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el){
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
                                validate: false,
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