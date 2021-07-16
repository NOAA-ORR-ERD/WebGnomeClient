define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'views/default/dzone',
    'views/form/spill/base',
    'views/cesium/cesium',
    'text!templates/form/spill/spatial.html',
    'model/spill/nesdisrelease',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, module, moment, DZone, BaseSpillForm,
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
            this.model = spillModel;
            this.loaded = true;
            this.model.trigger('ready');
            this._edit = options.edit;
        },

        render: function(options){
            
            if (this.loaded){
                var amount = this.model.get('amount');
                var units = this.model.get('units');
                var disabled = this.oilSelectDisabled();
                var cid = this.model.cid;
                var num_elements = this.model.get('release').get('num_elements');
                var filename = this.model.get('release').get('filename');             
                
                var all_oil_classes = this.model.get('release').get('oil_types');
                var all_thicknesses = this.model.get('release').get('thicknesses');
                var all_areas = this.model.get('release').get('record_areas');
                
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
                        
                        //Jay: this gets the indices in the arrays for each unique oil class
                        //the lint check hates it -- and I admit I got it from Google, there's
                        //probly a better way
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
                
                this.body = _.template(SpatialFormTemplate)({
                    name: this.model.get('name'),
                    amount: amount,
                    time: moment(this.model.get('release').get('release_time')).format(webgnome.config.date_format.moment),
                    oil_classes: oil_types,
                    oil_thicknesses: thicknesses,
                    record_areas: record_areas,
                    oil_volumes: volumes,
                    num_elements: num_elements,
                    showGeo: this.showGeo,
                    showSubstance: this.showSubstance,
                    disabled: disabled,
                    cid: cid,
                    filename: filename
                });
                BaseSpillForm.prototype.render.call(this, options);

            } else {
                this.model.on('ready', this.render, this);
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
                var release = this.model.get('release');/*
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
            for (var i = 0; i < thicknesses.length; i++) {
                for (var j = 0; j < ents.length; j++) {
                    if (ents[j].properties.feature_index.getValue() === i){
                        ents[j].properties.thickness = thicknesses[i];
                    }
                }
            }
            this.minimap.viewer.scene.requestRender();
            
            var name = this.$('#name').val();
            this.model.set('name', name);
                       
            var release = this.model.get('release');           
           
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var num_elements = this.$('#num_elements').val();
            //Set both release and end_release because continuous spatial release isn't 100% yet
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('end_release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));
            release.set('num_elements', num_elements);
           
           
            var units = this.$('#units').val();
            this.model.set('units', units);
            this.model.set('amount', this.$('#spill-amount').val());
            
            
            this.model.set('release', release);
            
            BaseSpillForm.prototype.update.call(this);


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
        

        upload: function(fileList, name){
            var uploadJSON = {'file_list': JSON.stringify(fileList),
             'obj_type': 'gnome.spill.release.NESDISRelease',
             'name': name,
             'session': localStorage.getItem('session')
            };
            var modelJSON = this.model.get('release').pick(['release_time', 'end_release_time', 'num_elements']);
            uploadJSON = _.extend(modelJSON, uploadJSON);
            $.post(webgnome.config.api + '/release/upload', uploadJSON
            ).done(_.bind(function(response) {
                var sr = new NESDISRelease(JSON.parse(response));
                this.model.set('release', sr);
                if (!_.isUndefined(sr.get('filename'))){
                    this.model.set('name', sr.get('filename'));
                }
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
            this.renderHelp();
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
    return NESDISSpillForm;
});