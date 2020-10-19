define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'views/default/dzone',
    'views/form/spill/continue',
    'views/form/spill/base',
    'views/cesium/cesium',
    'text!templates/form/spill/spatial.html',
    'model/spill/spatialrelease',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, module, moment, DZone,ContinueSpillForm, BaseSpillForm,
    CesiumView, SpatialFormTemplate, SpatialRelease){
    'use strict';
    var spatialSpillForm = ContinueSpillForm.extend({
        title: 'Spatial Release',
        className: 'modal form-modal spill-form continuespill-form',
        loaded: false,

        events: function(){
            return _.defaults({}, ContinueSpillForm.prototype.events());
        },

        render: function(options){
            if (this.loaded){
                var amount = this.model.get('amount');
                var duration = this.model.parseDuration();
                var units = this.model.get('units');
                var disabled = this.oilSelectDisabled();
                var cid = this.model.cid;
                var durationObj = moment.duration((parseFloat(duration.days, 10) * 24) + parseFloat(duration.hours, 10), 'h');
                var release_timesteps = (durationObj.asSeconds()/webgnome.model.get('time_step'));
                var num_elements = this.model.get('release').get('num_elements');
                var min_LEs;
                if (num_elements < release_timesteps) {
                    min_LEs = 'Less than 1 per timestep';
                } else if (duration.days === 0 && duration.hours === 0) {
                    min_LEs = 'Instantaneous release';
                } else {
                    min_LEs = '~' + Math.ceil(num_elements/release_timesteps) + ' per timestep';
                }
                this.body = _.template(SpatialFormTemplate, {
                    name: this.model.get('name'),
                    amount: amount,
                    time: _.isNull(this.model.get('release').get('release_time')) ? moment(webgnome.model.get('start_time')).format('YYYY/M/D H:mm') : moment(this.model.get('release').get('release_time')).format('YYYY/M/D H:mm'),
                    'duration': duration,
                    num_elements: num_elements,
                    release_timesteps: release_timesteps,
                    min_LEs: min_LEs,
                    showGeo: this.showGeo,
                    showSubstance: this.showSubstance,
                    disabled: disabled,
                    cid: cid
                });
                BaseSpillForm.prototype.render.call(this, options);

                var rate;
                if ((this.$('#rate-units').val()).indexOf('hr') === -1){
                    rate = parseFloat(amount) / durationObj.asDays();
                } else {
                    rate = parseFloat(amount) / durationObj.asHours();
                }

                this.$('#spill-rate').val(rate);

                if (!_.isUndefined(units)){
                    this.$('#rate-units').val(units + '/hr');
                } else {
                    var amountUnits = this.$('#units').val();
                    this.$('#rate-units').val(amountUnits + '/hr');
                }

                this.$('.slider').slider({
                    min: 0,
                    max: 5,
                    value: 0,
                    create: _.bind(function(){
                        this.$('.ui-slider-handle').html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div id="amount-tooltip" class="tooltip-inner">' + this.model.get('amount') + '</div></div>');
                    }, this),
                    slide: _.bind(function(e, ui){
                        this.updateAmountSlide(ui);
                    }, this)
                });

                if (!this.model.isNew()){
                    this.$('.slider').slider("option", "value", this.model.get('amount_uncertainty_scale') * 5);
                    this.updateAmount();
                    this.updateRate();
                }

                this.updateAmountSlide();

            } else {
                this.model.on('ready', this.render, this);
            }
            this.minimap = null;
            if (this.model.get('release').isNew()){
                this.dzone = new DZone({
                    maxFiles: 1,
                    maxFilesize: webgnome.config.upload_limits.current,
                    autoProcessQueue: true,
                    dictDefaultMessage: 'NESDIS Zip files only'
                });
                this.$('#upload-file').append(this.dzone.$el);

                this.listenTo(this.dzone, 'upload_complete', _.bind(this.upload, this));
            } else {
                this.minimap = new CesiumView();
                var map = webgnome.model.get('map');
                $('#spatial-minimap').show();
                $('#spatial-minimap').append(this.minimap.$el);
                this.minimap.render();
                map.getGeoJSON().then(_.bind(function(data){
                    map.processMap(data, null, this.minimap.viewer.scene.primitives);
                }, this));
                var release = this.model.get('release');
                Promise.all([release.getPolygons(), release.getMetadata()])
                .then(_.bind(function(data){
                        release.processPolygons(this.minimap.viewer, data[0]);
                        this.minimap.resetCamera(release);
                    }, this)
                );
            }
        },

        upload: function(fileList, name){
            var uploadJSON = {'file_list': JSON.stringify(fileList),
             'obj_type': 'gnome.spill.release.SpatialRelease',
             'name': name,
             'session': localStorage.getItem('session')
            };
            var modelJSON = this.model.get('release').pick(['release_time', 'end_release_time', 'num_elements']);
            uploadJSON = _.extend(modelJSON, uploadJSON);
            $.post(webgnome.config.api + '/release/upload', uploadJSON
            ).done(_.bind(function(response) {
                var sr = new SpatialRelease(JSON.parse(response));
                this.model.set('release', sr);
                this.$('#upload-file').hide();
                this.rerender();
            }, this)).fail(
                _.bind(this.dzone.reset, this.dzone)
            );
        },

        rerender: function() {
            this.$el.html('');
            delete this.dzone;
            this.render();
        },

        renderPositionInfo: function(e) {
            return;
        },

        initMapModal: function() {/*
            this.mapModal = new MapFormView({}, this.model.get('release'));
            this.mapModal.render();

            this.mapModal.on('hidden', _.bind(function() {
                this.show();
                this.mapModal.close();
            }, this));

            this.mapModal.on('save', this.setManualFields, this);
            this.hide();*/
            return;
        },
    });
    return spatialSpillForm;
});