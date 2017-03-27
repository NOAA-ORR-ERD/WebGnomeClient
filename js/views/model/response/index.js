define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/base',
    'text!templates/model/response/index.html',
    'text!templates/model/response/none.html',
    'views/model/response/burn',
    'views/form/oil/library',
    'views/form/water',
    'views/form/spill/type',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'model/element',
    'views/form/wind'
], function($, _, Backbone, module,
            BaseView, ResponseTemplate, NoResponseTemplate, BurnResponseListView,
            OilLibraryView, WaterForm, SpillTypeForm, SpillInstantForm, SpillContinueForm, ElementModel, WindForm){
    var responseView = BaseView.extend({
        className: 'response-view',
        children: [],
        attached: false,
        frame: 0,

        events:{
            'click .spill .select': 'renderSpillForm',
            'click .substance .select': 'renderOilLibrary',
            'click .water .select': 'renderWaterForm',
            'click .wind .select': 'renderWindForm',
            'click .response .select': 'clickResponse'
        },

        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);
            this.render();
        },

        render: function(){
            var template, skim, burn, disperse;
            if(webgnome.hasModel()){
                skim = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.roc.Skim'});
                burn = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.roc.Burn'});
                disperse = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.roc.Disperse'});
                if(skim || burn || disperse){
                    template = ResponseTemplate;
                } else {
                    this.setup_listeners();
                    template = NoResponseTemplate;
                }
                
                this.setup_listeners();
      
            } else {
                template = NoResponseTemplate;
                this.setup_listeners();
            }
            this.$el.html(_.template(template));
            if(this.attached === false){
                this.$el.appendTo('body');
                this.attached = true;
            }
            
            if(webgnome.model.get('spills').length === 0){
                this.$('.spill').addClass('missing');
            }

            if(!webgnome.model.getElementType() || !webgnome.model.getElementType().get('substance')){
                this.$('.substance').addClass('missing');
            }

            if(webgnome.model.get('environment').where({obj_type: 'gnome.environment.environment.Water'}).length === 0){
                this.$('.water').addClass('missing');
            }

            if(webgnome.model.get('environment').where({obj_type: 'gnome.environment.wind.Wind'}).length === 0){
                this.$('.wind').addClass('missing');
            }

            if(_.isUndefined(skim) && _.isUndefined(burn) && _.isUndefined(disperse)){
                this.$('.response').addClass('missing');
            }

            if(skim){
                this.renderSkim();
            }

            if(burn){
                this.renderBurn();
            }

            if(disperse){
                this.renderDisperse();
            }
        },

        load: function(){
            if(webgnome.cache.length > 0){
                // incase trajectory triggered a /step but it hasn't returned yet
                // and the user just toggled the switch to fate view
                // add a listener to handle that pending step.
                if(webgnome.cache.fetching){
                    webgnome.cache.once('step:recieved', this.load, this);
                } else {
                    while(this.frame < webgnome.cache.length){
                        webgnome.cache.at(this.frame, _.bind(this.loadStep, this));
                        this.frame++;
                    }
                }
            } else {
                webgnome.cache.on('step:recieved', this.buildDataset, this);
                setTimeout(function(){
                    webgnome.cache.step();
                }, 200);
            }
            if(localStorage.getItem('autorun') === 'true'){
                localStorage.setItem('autorun', '');
            }
        },

        loadStep: function(err, step){
           this.formatStep(step);

            // on the last step render the graph and if there are more steps start the steping.
            if(step.get('step_num') === webgnome.cache.length - 1){
                if(step.get('step_num') < webgnome.model.get('num_time_steps')){
                    webgnome.cache.on('step:recieved', this.buildDataset, this);
                    setTimeout(function(){
                        webgnome.cache.step();
                    }, 200);
                }
            }
        },

        renderLoop: function(){

        },

        clickResponse: function(){
            webgnome.router.navigate('config', true);
        },

        renderSpillForm: function() {
            if (webgnome.model.get('spills').length === 0) {
                var spillTypeForm = new SpillTypeForm();
                spillTypeForm.render();
                spillTypeForm.on('hidden', spillTypeForm.close);
                spillTypeForm.on('select', _.bind(function(form){
                    form.on('wizardclose', form.close);
                    form.on('save', _.bind(function(model){
                        webgnome.model.get('spills').add(form.model);
                        webgnome.model.save(null, {validate: false});
                        if(form.$el.is(':hidden')){
                            form.close();
                        } else {
                            form.once('hidden', form.close, form);
                        }
                    }, this));
                }, this));
            } else {
                var spill = webgnome.model.get('spills').at(0);
                var spillView;
                if (spill.get('release').get('release_time') !== spill.get('release').get('end_release_time')){
                    spillView = new SpillContinueForm(null, spill);
                } else {
                    spillView = new SpillInstantForm(null, spill);
                }
                spillView.on('save', function(){
                    spillView.on('hidden', spillView.close);
                });
                spillView.on('wizardclose', spillView.close);
                spillView.render();
            }
        },

        renderWaterForm: function() {
            var waterModel = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.environment.Water'});
            var waterForm = new WaterForm(null, waterModel);
            waterForm.on('hidden', waterForm.close);
            waterForm.on('save', _.bind(function(){
                webgnome.model.get('environment').add(waterForm.model, {merge:true});
                webgnome.model.save(null, {silent: true});
            }, this));
            waterForm.render();
        },

        renderOilLibrary: function() {
            var element_type;
            if (webgnome.model.getElementType()){
                element_type = webgnome.model.getElementType();
            } else {
                element_type = new ElementModel();
            }
            var oilLib = new OilLibraryView({}, element_type);
            oilLib.on('save wizardclose', _.bind(function(){
                if(oilLib.$el.is(':hidden')){
                    oilLib.close();
                } else {
                    oilLib.once('hidden', oilLib.close, oilLib);
                }
                webgnome.obj_ref[element_type.id] = element_type;
                this.render();
            }, this));
            oilLib.render();
        },

        renderWindForm: function() {
            var windForm;
            var windModel = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.wind.Wind'});

            if (!_.isNull(windModel)) {
                windForm = new WindForm(null, windModel);
            } else {
                windForm = new WindForm();
            }

            windForm.on('save', _.bind(function(){
                webgnome.model.get('environment').add(windForm.model, {merge: true});
                webgnome.model.save(null, {silent: true});
            }, this));

            windForm.on('hidden', windForm.close);
            windForm.render();
        },

        renderBurn: function(){
            responses = webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Burn'});
            burn = new BurnResponseListView({responses: responses});
            burn.$el.appendTo('.burn', this.$el);
            this.children.push(burn);
        },

        setup_listeners: function(){
            this.listenTo(webgnome.model, 'change', this.render);
            this.listenTo(webgnome.model.get('spills'), 'change add remove', this.render);
        },

        close: function(){
            BaseView.prototype.close.call(this);
            for(var child in this.children){
                this.children[child].close();
            }
        }
    });
    return responseView;

});
