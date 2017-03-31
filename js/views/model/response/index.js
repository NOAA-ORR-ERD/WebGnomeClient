define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'nucos',
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
], function($, _, Backbone, moment, nucos, module,
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
                this.renderTables();
                if(step.get('step_num') < webgnome.model.get('num_time_steps')){
                    webgnome.cache.on('step:recieved', this.buildDataset, this);
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

        formatStep: function(step){
            var nominal = step.get('WeatheringOutput').nominal;

            this.uncertainityExists = !_.isNull(step.get('WeatheringOutput').high);

            var high = _.isNull(step.get('WeatheringOutput').high) ? nominal : step.get('WeatheringOutput').high;
            var low = _.isNull(step.get('WeatheringOutput').low) ? nominal : step.get('WeatheringOutput').low;

            if(_.isUndefined(this.dataset)){
                this.dataset = [];
                var keyOrder = [
                    'amount_released',
                    'evaporated',
                    'natural_dispersion',
                    'sedimentation',
                    'dissolution',
                    'water_density',
                    'water_viscosity',
                    'dispersibility_difficult',
                    'dispersibility_unlikely'
                ];

                var titles = _.clone(nominal);

                if (webgnome.model.get('mode') !== 'adios' && webgnome.model.get('mode') !== 'roc'){
                    keyOrder.splice(keyOrder.length - 2, 0, 'beached', 'off_maps');
                } else {
                    delete titles.off_maps;
                    delete titles.beached;
                }

                var titlesKeys = Object.keys(titles);
                keyOrder = _.union(keyOrder, titlesKeys);
                var keys = keyOrder.filter(function(el, i, arr){
                    return !_.isUndefined(titles[el]);
                });

                keys.push('water_density', 'water_viscosity', 'dispersibility_difficult', 'dispersibility_unlikely');

                for(var type in keys){
                    this.dataset.push({
                        data: [],
                        high: [],
                        low: [],
                        nominal: [],
                        label: this.formatLabel(keys[type]),
                        name: keys[type],
                        direction: {
                            show: false
                        },
                        needle: {
                            label: _.bind(this.formatNeedleLabel, this),
                            formatX: _.bind(this.formatNeedleTime, this)
                        }
                    });
                }

                this.dataset.push({
                    name: 'secondtime',
                    data: [],
                    high: [],
                    low: [],
                    nominal: [],
                    xaxis: 2
                });
            }

            var date = moment(step.get('WeatheringOutput').time_stamp);
            var units = webgnome.model.get('spills').at(0).get('units');
            var api;
            if (_.isNull(webgnome.model.get('spills').at(0).get('element_type').get('substance'))){
                api = 10;
            } else {
                api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
            }
            var converter = new nucos.OilQuantityConverter();
            var water = webgnome.model.get('environment').findWhere({'obj_type': 'gnome.environment.environment.Water'});
            var waterDensity = water.getDensity();

            for(var set in this.dataset){
                var low_value, nominal_value, high_value;
                if([
                        'natural_dispersion',
                        'chem_dispersed',
                        'evaporated',
                        'floating',
                        'amount_released',
                        'skimmed',
                        'burned',
                        'beached',
                        'boomed',
                        'sedimentation',
                        'dissolution',
                        'off_maps',
                        'observed_beached'
                    ].indexOf(this.dataset[set].name) !== -1){
                    var min = _.min(step.get('WeatheringOutput'), this.runIterator(set), this);
                    low_value = min[this.dataset[set].name];
                    low_value = converter.Convert(low_value, 'kg', api, 'API degree', units);

                    var max = _.max(step.get('WeatheringOutput'), this.runIterator(set), this);
                    high_value = max[this.dataset[set].name];
                    high_value = converter.Convert(high_value, 'kg', api, 'API degree', units);

                    nominal_value = nominal[this.dataset[set].name];
                    nominal_value = converter.Convert(nominal_value, 'kg', api, 'API degree', units);
                }  else if (this.dataset[set].name === 'avg_viscosity') {
                    // Converting viscosity from m^2/s to cSt before assigning the values to be graphed
                    low_value = nucos.convert('Kinematic Viscosity', 'm^2/s', 'cSt', low[this.dataset[set].name]);
                    nominal_value = nucos.convert('Kinematic Viscosity', 'm^2/s', 'cSt', nominal[this.dataset[set].name]);
                    high_value = nucos.convert('Kinematic Viscosity', 'm^2/s', 'cSt', high[this.dataset[set].name]);

                } else if (this.dataset[set].name === 'water_content'){
                    // Convert water content into a % it's an easier unit to understand
                    // and graphs better
                    low_value = low[this.dataset[set].name] * 100;
                    nominal_value = nominal[this.dataset[set].name] * 100;
                    high_value = high[this.dataset[set].name] * 100;
                } else if (this.dataset[set].name === 'water_density'){
                    low_value = waterDensity;
                    nominal_value = waterDensity;
                    high_value = waterDensity;
                } else if (this.dataset[set].name === 'water_viscosity'){
                    low_value = 1;
                    nominal_value = 1;
                    high_value = 1;
                } else if (this.dataset[set].name === 'dispersibility_difficult'){
                    low_value = 2000;
                    nominal_value = 2000;
                    high_value = 2000;
                } else if (this.dataset[set].name === 'dispersibility_unlikely'){
                    low_value = 10000;
                    nominal_value = 10000;
                    high_value = 10000;
                } else if(this.dataset[set].name === 'systems'){
                    this.formatSystems(step);
                } else {
                    low_value = low[this.dataset[set].name];
                    nominal_value = nominal[this.dataset[set].name];
                    high_value = high[this.dataset[set].name];
                }

                this.dataset[set].high.push([date.unix() * 1000, high_value]);
                this.dataset[set].low.push([date.unix() * 1000, low_value]);
                this.dataset[set].data.push([date.unix() * 1000, nominal_value, 0, low_value, high_value]);
                this.dataset[set].nominal.push([date.unix() * 1000, nominal_value]);
            }
        },

        formatSystems: function(step){
            var systems = step.get('WeatheringOutput').nominal.systems;

            if(_.isUndefined(this.responseSystems)){
                this.responseSystems = {};
                for(var sys in systems){
                    this.responseSystems[sys] = [];
                    for (var attr in systems[sys]){
                        this.responseSystems[sys].push({
                            data: [],
                            high: [],
                            low: [],
                            nominal: [],
                            label: this.formatLabel(attr),
                            name: attr,
                            direction: {
                                show: false
                            },
                            needle: {
                                label: _.bind(this.formatNeedleLabel, this),
                                formatX: _.bind(this.formatNeedleTime, this)
                            }
                        });
                    }
                }
            }

            var date = moment(step.get('WeatheringOutput').time_stamp);
            var units = webgnome.model.get('spills').at(0).get('units');
            var api;
            if (_.isNull(webgnome.model.get('spills').at(0).get('element_type').get('substance'))){
                api = 10;
            } else {
                api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
            }
            var converter = new nucos.OilQuantityConverter();

            for (var sys in this.responseSystems){
                for(var set in this.responseSystems[sys]){
                    if([
                        'boomed',
                        'burned',
                        'skimmed',
                        'dispersed',
                        'treated'].indexOf(this.responseSystems[sys][set].name) !== -1){
                        nominal_value = systems[sys][this.responseSystems[sys][set].name];
                        nominal_value = converter.Convert(nominal_value, 'kg', api, 'API degree', units);

                        this.responseSystems[sys][set].data.push([date.unix() * 1000, nominal_value]);
                    }
                }
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
                this.formatStep(step);
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
            if(_.isUndefined(this.burnView)){
                responses = webgnome.model.get('weatherers').where({'obj_type': 'gnome.weatherers.roc.Burn'});
                this.burnView = new BurnResponseListView({
                    responses: responses,
                    results: webgnome.cache.inline[webgnome.cache.inline.length - 1].get('WeatheringOutput').nominal.systems,
                    dataset: this.responseSystems
                });
                // burn.$el.appendTo('.burn', this.$el);
                this.$('.burn').html(this.burnView.$el);
                this.children.push(this.burnView);
            } else {
                this.burnView.render(webgnome.cache.inline[webgnome.cache.inline.length - 1].get('WeatheringOutput').nominal.systems);
            }
        },

        renderSkim: function(){

        },

        renderDisperse: function(){

        },

        setup_listeners: function(){
            this.listenTo(webgnome.model, 'change', this.render);
            this.listenTo(webgnome.model.get('spills'), 'change add remove', this.render);
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
