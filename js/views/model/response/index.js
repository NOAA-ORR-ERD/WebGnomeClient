define([
    'jquery',
    'underscore',
    'backbone',
    'sweetalert',
    'moment',
    'nucos',
    'module',
    'views/base',
    'text!templates/model/response/index.html',
    'text!templates/model/response/none.html',
    'views/model/response/burn',
    'views/model/response/disperse',
    'views/model/response/skim',
    'views/form/oil/library',
    'views/form/water',
    'views/form/spill/type',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'model/movers/wind',
    'model/spill/gnomeoil',
    'views/form/wind'
], function($, _, Backbone, swal, moment, nucos, module,
            BaseView, ResponseTemplate, NoResponseTemplate, BurnResponseListView, DisperseListView, SkimListView,
            OilLibraryView, WaterForm, SpillTypeForm, SpillInstantForm, SpillContinueForm, WindmoverModel, GnomeOil, WindForm){
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
            'click .response .select': 'clickResponse',
        },

        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);
            if(webgnome.hasModel()){
                if(webgnome.model.validResponse()){
                    this.render();
                } else {
                    this.renderNoResponse();
                }
            } else {
                this.renderNoResponse();
            }
        },

        renderNoResponse: function(){
            if(webgnome.model.validResponse()){
                this.render();
            } else {
                if(this.attached === false){
                    this.setup_listeners();
                    this.$el.appendTo('body');
                    this.attached = true;
                }
                this.$el.html(_.template(NoResponseTemplate));
            }
            if(webgnome.model.get('spills').length === 0){
                this.$('.spill').addClass('missing');
            }

            if(!webgnome.model.getSubstance().get('is_weatherable')){
                this.$('.substance').addClass('missing');
            }

            if(webgnome.model.get('environment').where({obj_type: 'gnome.environment.water.Water'}).length === 0){
                this.$('.water').addClass('missing');
            }

            if(webgnome.model.get('environment').where({obj_type: 'gnome.environment.wind.Wind'}).length === 0){
                this.$('.wind').addClass('missing');
            }

            var skim = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.roc.Skim'});
            var burn = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.roc.Burn'});
            var disperse = webgnome.model.get('weatherers').findWhere({'obj_type': 'gnome.weatherers.roc.Disperse'});
            if(_.isUndefined(skim) && _.isUndefined(burn) && _.isUndefined(disperse)){
                this.$('.response').addClass('missing');
            }
        },

        render: function(){
            this.$el.html(_.template(ResponseTemplate));
            if(this.attached === false){
                this.$el.appendTo('body');
                this.attached = true;
            }
            this.load();
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
                this.listenTo(webgnome.cache, 'step:recieved', this.buildDataset);
                setTimeout(function(){
                    webgnome.cache.step();
                }, 200);
            }
            if(localStorage.getItem('autorun') === 'true'){localStorage.setItem('autorun', '');
            }
        },

        loadStep: function(err, step){
            // on the last step render the graph and if there are more steps start the steping.
            if(step.get('step_num') === webgnome.cache.length - 1){
                this.renderTables();
                if(step.get('step_num') < webgnome.model.get('num_time_steps')){
                    this.listenTo(webgnome.cache, 'step:recieved', this.buildDataset);
                    setTimeout(function(){
                        webgnome.cache.step();
                    }, 200);
                }
            }
        },

        renderLoop: function(){
            if(_.isUndefined(this.dataset)){
                webgnome.cache.step();
            } else {
                this.renderTables();
            }
        },

        
        formatLabel: function(label){
            return label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, ' ');
        }, 

        validateDataset: function() {
            if (this.dataset) {
                return this.dataset[0].data.length === webgnome.cache.length;
            }
            return true;
        },

        buildDataset: function(step){
            if(_.has(step.get('WeatheringOutput'), 'nominal')){
                if(this.validateDataset()){
                    webgnome.cache.step();
                    this.frame++;
                    this.renderTables();
                } else {
                    webgnome.cache.off('step:recieved', this.buildDataset, this);
                    delete this.dataset;
                    this.frame = 0;
                    this.load();
                }
            } else {
                swal({
                    title: 'Model Output Error',
                    text: 'No weathering output was found for step #' + step.get('step_num'),
                    type: 'error'
                });
            }
        },

        renderTables: function(){
            this.renderBurn();
            this.renderSkim();
            this.renderDisperse();

        },

        toggleLists: function(view){
            var child;
            if(!_.isUndefined(view)){
                for(child in this.children){
                    this.children[child].$el.hide();
                }
                view.show();
            } else {
                for(child in this.children){
                    this.children[child].$el.show();
                }
            }
            
        },

        runIterator: function(set){
            return (function(run){
                if (!_.isNull(run)){
                    return run[this.dataset[set].name];
                }
            });
        },

        pluckDataset: function(dataset, leaves){
            return _.filter(dataset, function(set){
                return leaves.indexOf(set.name) !== -1;
            });
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
            var waterModel = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.water.Water'});
            var waterForm = new WaterForm(null, waterModel);
            waterForm.on('hidden', waterForm.close);
            waterForm.on('save', _.bind(function(){
                webgnome.model.get('environment').add(waterForm.model, {merge:true});
                webgnome.model.save(null, {silent: true});
            }, this));
            waterForm.render();
        },

        renderOilLibrary: function(e) {
            //this will be bugged
            var substance = new GnomeOil();
            var oilLib = new OilLibraryView({}, substance);

            oilLib.on('save wizardclose', _.bind(function() {
                if (oilLib.$el.is(':hidden')) {
                    oilLib.close();
                    webgnome.model.setGlobalSubstance(substance);
                }
                else {
                    oilLib.once('hidden', oilLib.close, oilLib);
                }
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
                webgnome.model.get('movers').add(new WindmoverModel({wind: windForm.model}));
                webgnome.model.save(null, {silent: true});
            }, this));

            windForm.on('hidden', windForm.close);
            windForm.render();
        },

        renderBurn: function(){
            if(_.isUndefined(this.burnView)){
                var weatherers = webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Burn'});
                this.burnView = new BurnResponseListView({
                    weatherers: weatherers,
                    process: 'burned',
                    colors: {
                        'collect': 'green',
                        'transit': 'orange',
                        'burn': 'red',
                        'clean': 'black'
                    }
                });
                // burn.$el.appendTo('.burn', this.$el);
                this.$('.burn').html(this.burnView.$el);
                this.children.push(this.burnView);
                this.listenTo(this.burnView, 'select', this.toggleLists);
            } else {  
                this.burnView.render();
            }
        },

        renderSkim: function(){
            if(_.isUndefined(this.skimView)){
                var weatherers = webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Skim'});
                this.skimView = new SkimListView({
                    weatherers: weatherers,
                    process: 'skimmed',
                    colors: {
                        'skim': 'green',
                        'transit': 'red',
                        'offload': 'orange'
                    }
                });
                this.$('.skim').html(this.skimView.$el);
                this.children.push(this.skimView);
                this.listenTo(this.skimView, 'select', this.toggleLists);
            } else {
                this.skimView.render();
            }
        },

        renderDisperse: function(){
            if(_.isUndefined(this.disperseView)){
                var weatherers = webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Disperse'});
                this.disperseView = new DisperseListView({
                    weatherers: weatherers,
                    process: 'dispersed',
                    colors: {
                        'reload': 'orange',
                        'transit': 'blue',
                        'onsite': 'green'
                    }
                });
                this.$('.disperse').html(this.disperseView.$el);
                this.children.push(this.disperseView);
                this.listenTo(this.disperseView, 'select', this.toggleLists);
            } else {
                this.disperseView.render();
            }
        },

        setup_listeners: function(){
            this.listenTo(webgnome.model, 'change', this.renderNoResponse);
            this.listenTo(webgnome.model.get('spills'), 'change add remove', this.renderNoResponse);
        },

        formatNeedleLabel: function(text, n){
            var num = parseFloat(parseFloat(text).toPrecision(this.dataPrecision)).toString();
            var units;

            if (n === 1) {
                units = $('#weatherers .tab-pane:visible .yaxisLabel').text();
            } else {
                units = $('#weatherers .tab-pane:visible .secondYaxisLabel').text();
            }
            
            return num + ' ' + units;
        },

        formatNeedleTime: function(text){
            var unix_time = parseInt(text, 10);

            return moment(unix_time).format(webgnome.config.date_format.moment);
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
