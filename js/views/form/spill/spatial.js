define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'views/default/dzone',
    'views/form/spill/base',
    'views/cesium/cesium',
    'text!templates/form/spill/spatial.html',
    'model/spill/spatialrelease',
    'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, module, moment, DZone, BaseSpillForm,
    CesiumView, SpatialFormTemplate, SpatialRelease){
    'use strict';
    var spatialSpillForm = BaseSpillForm.extend({
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
        },

        render: function(options){
            
            if (this.loaded){
                var amount = this.model.get('amount');
                var units = this.model.get('units');
                var disabled = this.oilSelectDisabled();
                var cid = this.model.cid;
                var num_elements = this.model.get('release').get('num_elements');
                var filename = this.model.get('release').get('filename')              
                
                var all_oil_classes = this.model.get('release').get('oil_types');
                var all_thicknesses = this.model.get('release').get('thicknesses');
                var all_areas = this.model.get('release').get('areas');
                
                var oil_types = [];
                var thicknesses = [];
                var areas = [];
                var volumes = [];
                
                if (typeof all_oil_classes !== 'undefined') {
                    
                    var uniq_oil_classes = _.uniq(all_oil_classes)    
                    //table has summaries for each oil class -- may be one or more records in shapefile (and in thickness/area arrays)
                    for (var i = 0; i < uniq_oil_classes.length; i++) {
                        
                        oil_types.push(uniq_oil_classes[i])
                        var oilclass_ids = [];
                        all_oil_classes.forEach((c, index) => c === uniq_oil_classes[i] ? oilclass_ids.push(index) : null)
                        
                        thicknesses.push(all_thicknesses[oilclass_ids[0]] * 1e6) //microns
                        
                        
                        var area_sum = 0;
                        for (var j =0; j < oilclass_ids.length; j++) {
                            area_sum = area_sum + all_areas[oilclass_ids[j]]
                        }
                        areas.push((area_sum/1e6).toFixed(2)) //square km
                        

                        volumes.push((area_sum * all_thicknesses[oilclass_ids[0]] * 6.28981077).toFixed(1)) //barrels
                
                    }
                    
                    amount = volumes.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) 
                }
                
                this.body = _.template(SpatialFormTemplate, {
                    name: this.model.get('name'),
                    amount: amount,
                    time: moment(this.model.get('release').get('release_time')).format(webgnome.config.date_format.moment),
                    oil_classes: oil_types,
                    oil_thicknesses: thicknesses,
                    oil_areas: areas,
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
                        var ds = release.processPolygons(data[0]);
                        this.minimap.viewer.dataSources.add(ds);
                        this.minimap.resetCamera(release);
                    }, this)
                );
            }
        },
        
        update: function(e) {
            
            var name = this.$('#name').val();
            this.model.set('name', name);
                       
            var release = this.model.get('release');           
           
            var releaseTime = moment(this.$('#datetime').val(), 'YYYY/M/D H:mm');
            var num_elements = this.$('#num_elements').val();           
            release.set('release_time', releaseTime.format('YYYY-MM-DDTHH:mm:ss'));        
            release.set('num_elements', num_elements);
           
           
            var units = this.$('#units').val();
            this.model.set('units', units);
            
            
            this.model.set('release', release);
            
            BaseSpillForm.prototype.update.call(this);


        },
        
        updateVolume: function(e) {

            var ind = e.currentTarget.id.split('_')[1];
            var new_thickness = parseFloat(e.currentTarget.value);
                                 
            var oil_type = this.$('#oil_type_' + ind).text();
            
            var total_volume = 0
            var class_volume = 0
                                    
            var release = this.model.get('release');           
            var all_oil_classes = release.get('oil_types');
            var all_thicknesses = release.get('thicknesses');
            var all_areas = release.get('areas');
            for (var i = 0; i < all_oil_classes.length; i++) {
                if (all_oil_classes[i] == oil_type) {
                    all_thicknesses[i] = new_thickness/1e6;
                    class_volume =  class_volume + new_thickness * all_areas[i]/1e6 * 6.28981077
                }
                total_volume = total_volume + parseFloat(all_thicknesses[i]) * parseFloat(all_areas[i]) * 6.28981077
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
            var total_volume = 0

            var release = this.model.get('release');           
            var all_oil_classes = release.get('oil_types');
            var all_thicknesses = release.get('thicknesses');
            var all_areas = release.get('areas');
            
            var oilclass_ids = [];
            all_oil_classes.forEach((c, index) => c === oil_type ? oilclass_ids.push(index) : null)
            var area_sum = 0;
            for (var i =0; i < oilclass_ids.length; i++) {
                    area_sum = area_sum + all_areas[oilclass_ids[i]]
                }
                
            var new_thickness = (new_volume/6.28981077)/(area_sum)
            
            var total_volume = 0
            for (var i = 0; i < all_oil_classes.length; i++) {
                if (all_oil_classes[i] == oil_type) {                  
                    all_thicknesses[i] = new_thickness;                   
                }
                total_volume = total_volume + parseFloat(all_thicknesses[i]) * parseFloat(all_areas[i]) * 6.28981077
            }
            release.set('thicknesses', all_thicknesses);
            
            new_thickness = new_thickness * 1e6
            this.$('#thickness_' + ind).val(new_thickness.toFixed(1));
            //total spill volume
            this.model.set('amount', total_volume.toFixed(1));
            this.$('#spill-amount').val(total_volume.toFixed(1));
            
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