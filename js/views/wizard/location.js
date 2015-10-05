define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'views/wizard/base',
    'model/gnome',
    'model/location',
    'model/environment/wind',
    'model/movers/wind',
    'model/outputters/trajectory',
    'views/form/text',
    'views/form/model',
    'views/form/wind',
    'views/modal/loading'
], function($, _, Backbone, swal, BaseWizard, GnomeModel,
    GnomeLocation, GnomeWind, GnomeWindMover,
    TrajectoryOutputter,
    TextForm, ModelForm, WindForm, LoadingModal){
    'use strict';
    var locationWizardView = BaseWizard.extend({
        steps: [],
        initialize: function(opts){
            this.location = new GnomeLocation({id: opts.slug});
            this.name = opts.name;
            this.location.fetch({
                success: _.bind(this.found, this),
                error: _.bind(this.notfound, this)
            });
        },

        found: function(){
            webgnome.model.fetch({
                success: _.bind(this.load_location, this),
                error: _.bind(this.failed_load, this)
            });
        },

        failed_load: function(){
            console.log('Location model failed to load');
            swal({
                title: 'Failed to Load Location',
                text: 'Something went wrong while loading the location model.',
                type: 'error',
            });
        },

        load_location: function(){
            // clear any previously loaded steps
            _.each(this.steps, function(el){
                el.close();
            });
            this.steps = [];

            // set up each step described in the location file.
            _.each(this.location.get('steps'), _.bind(function(el){
                var title = [];
                title[0] = el.title;
                title[1] = '<span class="sub-title">' + this.name + '</span>';
                console.log(el.buttons);
                if(el.type === 'text' || el.type === 'welcome'){
                    if(!el.title){
                        title[0] = 'Welcome';
                    }
                    this.steps.push(new TextForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }));
                } else if (el.type === 'model') {
                    this.steps.push(new ModelForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: el.buttons
                    }, webgnome.model));
                } else if (el.type === 'wind') {
                    if(!el.title){
                        title[0] = 'Wind';
                    }
                    var wind = new GnomeWind();
                    var windform = new WindForm({
                        name: el.name,
                        title: title.join(' '),
                        body: el.body,
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='next'>Next</button>"
                    }, wind);
                    windform.on('save', _.bind(function(){
                        webgnome.model.get('environment').add(wind, {merge: true});
                    }, this));

                    this.steps.push(windform);
                } else if (el.type === 'finish') {
                    if (!el.title){
                        title[0] = 'Finalize Model';
                    }
                    var finishForm = new TextForm({
                        name: el.name,
                        title: title.join(' '),
                        body: "<div>Filler Text</div>",
                        buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='finish' data-dismiss='modal'>Finalize Model</button>"
                    });
                    finishForm.on('hidden', function(){
                        finishForm.trigger('finish');
                        webgnome.model.fetch();
                        webgnome.router.navigate('config', true);
                        $('.spill .add').click();
                    });

                    this.steps.push(finishForm);
                }

            }, this));

            this.start();
        },

        notfound: function(){
            console.log('location was not found');
            swal({
                title: 'Location Not Found',
                text: 'The requested location wasn\'t found on the server',
                type: 'error',
            });
        }
    });

    return locationWizardView;
});