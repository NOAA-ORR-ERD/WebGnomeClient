define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'views/default/help',
    'views/default/dzone',
    'views/form/spill/base',
    'views/cesium/cesium',
    'text!templates/form/spill/spatial.html',
    'model/spill/nesdisrelease',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, module, moment, HelpView, DZone, BaseSpillForm,
    CesiumView, SpatialFormTemplate, NESDISRelease){
    'use strict';
    var NESDISSpillForm = BaseSpillForm.extend({
        title: 'NOAA/NESDIS Spatial Release',
        className: 'modal form-modal spill-form spatialspill-form',
        loaded: false,

        events: function(){
            return _.defaults({
                'change .oil_volume': 'updateThickness',
                'change .oil_thickness': 'updateVolume', 
            }, BaseSpillForm.prototype.events());
        },
        
        initialize: function(options, spillModel){
            this.module = module;
            BaseSpillForm.prototype.initialize.call(this, options, spillModel);
            //special case for upload form
            this.help = new HelpView({path: this.module.id + '_upload', context: 'modal'});
            this.help.trigger('ready');
            this.model = spillModel;
            this.model.trigger('ready');
            this._edit = options.edit;
        },

        render: function(options){            

            var amount = this.model.get('amount');
            var duration = this.model.parseDuration();
            var units = this.model.get('units');
            var disabled = this.oilSelectDisabled();
            var cid = this.model.cid;
            var durationObj = moment.duration((parseFloat(duration.days, 10) * 24) + parseFloat(duration.hours, 10), 'h');
            var release_timesteps = (durationObj.asSeconds()/webgnome.model.get('time_step'));
            var release = this.model.get('release');
            var num_elements = release.get('num_elements');
            var min_LEs;
            if (num_elements < release_timesteps) {
                min_LEs = 'Less than 1 per timestep';
            } else if (duration.days === 0 && duration.hours === 0) {
                min_LEs = 'Instantaneous release';
            } else {
                min_LEs = '~' + Math.ceil(num_elements/release_timesteps) + ' per timestep';
            }
            var filename = release.get('filename');             
            
            var all_oil_classes = release.get('oil_types');
            var all_thicknesses = release.get('thicknesses');
            var all_areas = release.get('record_areas');
            
            var oil_types = [];
            var thicknesses = [];
            var record_areas = [];
            var volumes = [];
            
            if (typeof all_oil_classes !== 'undefined') {
                
                var uniq_oil_classes = _.uniq(all_oil_classes);    
                //table has summaries for each oil class -- may be one or more records in shapefile (and in thickness/area arrays) 
                
                for (var i = 0; i < uniq_oil_classes.length; i++) {
                    
                    oil_types.push(uniq_oil_classes[i]);
                    var oilclass_ids = [];
                    

                    for (var k = 0; k < all_oil_classes.length; k++) {
                        if (all_oil_classes[k] === uniq_oil_classes[i]) {
                            oilclass_ids.push(k);
                        }
                    }
                    
                    thicknesses.push(all_thicknesses[oilclass_ids[0]] * 1e6);//microns
                    

                    var area_sum = 0;
                    for (var j =0; j < oilclass_ids.length; j++) {
                        area_sum = area_sum + all_areas[oilclass_ids[j]];
                    }
                    record_areas.push((area_sum/1e6).toFixed(2)); //square km                       
                    volumes.push((area_sum * all_thicknesses[oilclass_ids[0]] * 6.28981077).toFixed(1)); //barrels
            
                }
                
                amount = volumes.reduce(function(a, b) {return parseFloat(a) + parseFloat(b);}, 0); 
            }

            var release_tz = release.get('timezone_offset').get('title').split('[')[0];
            var release_time = moment(release.get('release_time'));
            var model_offset = webgnome.model.get('timezone_offset').get('offset');
            var local_time = moment(release_time);
            var adjust_tz_checked = true;

            var local_time = this.localReleaseTime(release_time, model_offset);                   


            if (_.isNull(model_offset)) {
                adjust_tz_checked = false;
            }

            this.body = _.template(SpatialFormTemplate)({
                name: this.model.get('name'),
                amount: amount,
                time: release_time.format(webgnome.config.date_format.moment),
                release_tz, release_tz,
                tz_select: this.genTimeZoneSelect(),
                adjust_tz_checked: adjust_tz_checked,
                local_time: local_time.format(webgnome.config.date_format.moment),
                duration: duration,
                oil_classes: oil_types,
                oil_thicknesses: thicknesses,
                record_areas: record_areas,
                oil_volumes: volumes,
                num_elements: num_elements,
                release_timesteps: release_timesteps,
                min_LEs: min_LEs,
                showGeo: this.showGeo,
                showSubstance: this.showSubstance,
                disabled: disabled,
                cid: cid,
                filename: filename
            });

            BaseSpillForm.prototype.render.call(this, options);
                

            if (typeof all_oil_classes === 'undefined') {
            //if (thicknesses.length === 0) {
                var rate;
                if ((this.$('#rate-units').val()).indexOf('hr') === -1){
                    rate = parseFloat(amount) / durationObj.asDays();
                } else {
                    rate = parseFloat(amount) / durationObj.asHours();
                }

                if (rate !== Infinity) {
                    this.$('#spill-rate').val(rate);
                }

                if (!_.isUndefined(units)){
                    this.$('#rate-units').val(units + '/hr');
                } else {
                    var amountUnits = this.$('#units').val();
                    this.$('#rate-units').val(amountUnits + '/hr');
                }
                if (!this.model.isNew()){
                    this.updateAmount();
                    this.updateRate();
                }
            }

            
            this.minimap = null;
            if (this.model.get('release').isNew()){
                this.dzone = new DZone({
                    maxFiles: 1,
                    maxFilesize: webgnome.config.upload_limits.wind,
                    autoProcessQueue: true,
                    //dictDefaultMessage: 'NESDIS Zip files only'
                });

                this.listenTo(this.dzone, 'upload_complete', _.bind(this.upload, this));
                this.$('.row').slice(1).hide(); //hide all except upload file row
                this.$('#upload-file').append(this.dzone.$el);
            } else {
                this.minimap = new CesiumView();
                var map = webgnome.model.get('map');
                $('#spatial-minimap').show();
                $('#spatial-minimap').append(this.minimap.$el);
                this.minimap.render();
                map.getGeoJSON().then(_.bind(function(data){
                    map.processMap(data, null, this.minimap.viewer.scene.primitives);
                }, this));               
                /*
                Promise.all([release.getPolygons(), release.getMetadata()])
                .then(_.bind(function(data){
                        var ds = release.processPolygons(data[0]);
                        this.minimap.viewer.dataSources.add(ds);
                        this.minimap.viewer.relobj = ds;
                        this.minimap.resetCamera(release);
                    }, this)
                );
                */
               this.minimap.viewer.dataSources.add(release.processPolygons());
               this.minimap.resetCamera(release);
            }
            //if in 'edit' mode, re-enable save button
            if (this._edit){
                this.$('.save').prop('disabled', false);
                this.help = new HelpView({path: this.module.id, context: 'modal'});
            } else {
                if(this.model.get('release').get('filename')){
                    this.$('.save').prop('disabled', false);
                } else{
                    this.$('.save').prop('disabled', true);
                }
            }
        },
        
        update: function(e) {
            //Need to go through each Feature and apply the new thickness to their sub-polygons
            //The .feature geojson attribute is not updated here despite it potentially
            //now being inconsistent. this is because it is being treated as a read-only attribute
            var ents = this.minimap.viewer.dataSources._dataSources[0].entities.values;
            var thicknesses = this.model.get('release').get('thicknesses');
            if(thicknesses) {
                for (var i = 0; i < thicknesses.length; i++) {
                    for (var j = 0; j < ents.length; j++) {
                        if (ents[j].properties.feature_index.getValue() === i){
                            ents[j].properties.thickness = thicknesses[i];
                        }
                    }
                }
            }
            this.minimap.viewer.scene.requestRender();
            
            var name = this.$('#name').val();
            this.model.set('name', name);
                       
            var amount = parseFloat(this.$('#spill-amount').val());
            if (isNaN(amount)){
                amount = 0;
            } else {
                this.$('#spill-amount').val(amount);
            }

            var release = this.model.get('release');      
                       
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var offset = this.$('#timeoffset').val();
            //offset = (offset !== '') ? parseFloat(offset) : null;
            var local_time = this.localReleaseTime(releaseTime, offset);
            this.$('#local_time').html(local_time.format(webgnome.config.date_format.moment)); 


            var num_elements = this.$('#num_elements').val();
            // Don't allow different end_release for NESDIS releases           
            if(thicknesses) {
                //release.set('end_release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
                release.set('end_release_time', release.get('release_time'));
            } else {
                var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
                var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
                var duration = (((parseInt(days, 10) * 24) + parseFloat(hours, 10)) * 60) * 60;
                var endTime = releaseTime.add(duration, 's').format();
                release.set('end_release_time', endTime);
            }
            release.set('num_elements', num_elements);
           
           
            var units = this.$('#units').val();
            this.model.set('units', units);
            this.model.set('amount', this.$('#spill-amount').val());
                       
            this.model.set('release', release);

        
            BaseSpillForm.prototype.update.call(this);
            if (!thicknesses && !_.isUndefined(e)) {
                this.inputFieldUpdate(e);
            }


        },
        
        updateVolume: function(e) {

            var ind = e.currentTarget.id.split('_')[1];
            var new_thickness = parseFloat(e.currentTarget.value);
                                 
            var oil_type = this.$('#oil_type_' + ind).text();
            
            var total_volume = 0;
            var class_volume = 0;
                                    
            var release = this.model.get('release');           
            var all_oil_classes = release.get('oil_types');
            var all_thicknesses = release.get('thicknesses');
            var all_areas = release.get('record_areas');
            for (var i = 0; i < all_oil_classes.length; i++) {
                if (all_oil_classes[i] === oil_type) {
                    all_thicknesses[i] = new_thickness/1e6;
                    class_volume =  class_volume + new_thickness * all_areas[i]/1e6 * 6.28981077;
                }
                total_volume = total_volume + parseFloat(all_thicknesses[i]) * parseFloat(all_areas[i]) * 6.28981077;
            }
            release.set('thicknesses', all_thicknesses);
            
            this.$('#volume_' + ind).val(class_volume.toFixed(1));
            //total spill volume
            this.model.set('amount', total_volume.toFixed(1));
            this.$('#spill-amount').val(total_volume.toFixed(1));
        },
        
        updateThickness: function(e) {
            
            var ind = e.currentTarget.id.split('_')[1];
            var new_volume = parseFloat(e.currentTarget.value);
            
            var oil_type = this.$('#oil_type_' + ind).text();

            var release = this.model.get('release');           
            var all_oil_classes = release.get('oil_types');
            var all_thicknesses = release.get('thicknesses');
            var all_areas = release.get('record_areas');
            
            var oilclass_ids = [];
            all_oil_classes.forEach((c, index) => c === oil_type ? oilclass_ids.push(index) : null);
            var area_sum = 0;
            for (var i =0; i < oilclass_ids.length; i++) {
                    area_sum = area_sum + all_areas[oilclass_ids[i]];
                }
                
            var new_thickness = (new_volume/6.28981077)/(area_sum);
            
            var total_volume = 0;
            for (i = 0; i < all_oil_classes.length; i++) {
                if (all_oil_classes[i] === oil_type) {                  
                    all_thicknesses[i] = new_thickness;                   
                }
                total_volume = total_volume + parseFloat(all_thicknesses[i]) * parseFloat(all_areas[i]) * 6.28981077;
            }
            release.set('thicknesses', all_thicknesses);
            
            new_thickness = (new_thickness * 1e6).toFixed(1);
            this.$('#thickness_' + ind).val(new_thickness);
            //total spill volume
            this.model.set('amount', total_volume.toFixed(1));
            this.$('#spill-amount').val(total_volume.toFixed(1));
            
        },

        inputFieldUpdate: function(e) {
            var rateChanged = this.$(e.currentTarget).is('#spill-rate') || this.$(e.currentTarget).is('#rate-units');
            var amountChanged = this.$(e.currentTarget).is('#spill-amount') || this.$(e.currentTarget).is('#units');
            var durationChanged = this.$(e.currentTarget).is('#days') || this.$(e.currentTarget).is('#hours');
            var LEsChanged = this.$(e.currentTarget).is('#num_elements');

            if (rateChanged) {
                this.updateAmount();
            } else if (amountChanged) {
                this.updateRate();
            } else if (durationChanged) {
                this.updateRate();
                this.updateMinLE();
            } else if (LEsChanged) {
                this.updateMinLE();
            }
        },

        updateMinLE: function(){
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            var num_elements = this.$('#num_elements').val();
            var release_timesteps = (duration * 3600) / webgnome.model.get('time_step');
            var min_LEs;
            if (duration === 0) {
                min_LEs = 'Instantaneous release';
            } else {
                min_LEs = '~' + Math.ceil(num_elements/release_timesteps) + ' per timestep';
            }
            if (num_elements >= release_timesteps) {
                this.$('#min_LEs').text(min_LEs);
                document.getElementById("min_LEs").className = "label label-info";
            } else {
                this.$('#min_LEs').text('Less than 1 per timestep');
                document.getElementById("min_LEs").className = "label label-danger";
            }
        },

        updateRate: function(){
            var amount = parseFloat(this.$('#spill-amount').val());
            var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
            var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
            var duration = ((days * 24) + parseFloat(hours));
            if (duration > 0) {
                this.$('#spill-rate').attr('disabled', null);
            } else {
                this.$('#spill-rate').attr('disabled', 'disabled');
            }
            this.rate = amount / duration;
            var units = this.$('#units').val();
            if (units === 'bbl' && this.rate % 24 === 0) {
                this.$('#spill-rate').val(this.rate / 24);
                this.$('#rate-units').val('bbl/day');
            } else {
                if (this.rate !== Infinity) {
                    this.$('#spill-rate').val(this.rate);
                }

                this.$('#rate-units').val(units + '/hr');
            }
            //this.updateAmountSlide();
        },

        updateAmount: function(){
            if(this.$('#rate-units').val() !== ''){
                this.rate = parseFloat(this.$('#spill-rate').val());
                var amount;
                if (_.isNaN(this.rate)) {
                    amount = this.model.get('amount');
                } else {
                    var days = this.$('#days').val().trim() ? this.$('#days').val().trim() : 0;
                    var hours = this.$('#hours').val().trim() ? this.$('#hours').val().trim() : 0;
                    var duration = ((days * 24) + parseFloat(hours));
                    if (this.$('#rate-units').val() === 'bbl/day'){
                        amount = this.rate * duration / 24;
                    } else {
                        amount = this.rate * duration;
                    }
                }
                this.$('#spill-amount').val(amount);
                this.model.set('amount', amount);
                var units = this.$('#rate-units').val().split('/')[0];
                this.$('#units').val(units);
                //this.updateAmountSlide();
            }
        },

        upload: function(fileList, name){
            var uploadJSON = {'file_list': JSON.stringify(fileList),
             'obj_type': 'gnome.spills.release.NESDISRelease',
             'name': name,
             'session': localStorage.getItem('session')
            };
            var modelJSON = this.model.get('release').pick(['release_time', 'end_release_time', 'num_elements']);
            uploadJSON = _.extend(modelJSON, uploadJSON);
            this.lockControls();
            $.post(webgnome.config.api + '/release/upload', uploadJSON
            ).done(_.bind(function(response) {
                //need to parse in this manner so timezone_offset is turned into a Backbone model properly
                var sr = new NESDISRelease(NESDISRelease.prototype.parse(JSON.parse(response)));
                this.model.set('release', sr);
                if (!_.isUndefined(sr.get('filename'))){
                    this.model.set('name', sr.get('filename'));
                }
                this.$('#upload-file').hide();
                //set help back to default behavior
                this.help = new HelpView({path: this.module.id, context: 'modal'});

                this.rerender();
            }, this)).fail(
                _.bind(this.dzone.reset, this.dzone)
            ).always(
                _.bind(function(){
                    this.unlockControls();
                },this)
            );
        },

        rerender: function() {
            this.$el.html('');
            delete this.dzone;
            this.render();
            this.renderHelp();
        },

        renderPositionInfo: function(e) {
            return;
        },

 
        localReleaseTime: function(release_time, new_offset) {
            //update release from UTC to model timezone for display
            var release = this.model.get('release');
            var release_offset = parseFloat(release.get('timezone_offset').get('offset'));                                 
            var new_offset = (!_.isNull(new_offset)) ? new_offset : 0;
            var offset = parseFloat(new_offset) - release_offset
            var local_time =  moment(release_time).add(offset,'hour');
            return(local_time);      
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

        applyOffset: function() {
            var offset = this.$('#timeoffset').val();
            offset = (offset !== '') ? parseFloat(offset) : null;
            var selected = this.$('#adjust_tz_to_model').is(':checked');
            var release_time_offset = this.model.get('release').get('timezone_offset'); 
            if (selected) {
                release_time_offset.set('offset', offset);
                release_time_offset.set('title', this.$('#timeoffset option:selected').text());//release.set('release_time', local_time.format('YYYY-MM-DDTHH:mm:ss'));
            } 
            var model_time_offset = webgnome.model.get('timezone_offset');
            model_time_offset.set('offset', offset);
            model_time_offset.set('title', this.$('#timeoffset option:selected').text());
            webgnome.model.set('timezone_offset', model_time_offset);

        },

        save: function() {
            this.applyOffset(); 
            BaseSpillForm.prototype.save.call(this);
        },

    });
    return NESDISSpillForm;
});
