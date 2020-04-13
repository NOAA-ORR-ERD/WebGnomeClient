define([
    'jquery',
    'underscore',
    'cesium',
], function ($, _, Cesium) {
    "use strict";
    var Graticule = function(DMS, scene, maxLines, containerName) {


        var DEGREE = 1.0;
        var MINUTE = DEGREE / 60.0;
        var SECOND = MINUTE / 60.0;

        this.DMS_STEPS = [SECOND * 15,
                        SECOND * 30,
                        MINUTE,
                        MINUTE * 2,
                        MINUTE * 3,
                        MINUTE * 4,
                        MINUTE * 5,
                        MINUTE * 10,
                        MINUTE * 15,
                        MINUTE * 20,
                        MINUTE * 30,
                        DEGREE,
                        DEGREE * 2,
                        DEGREE * 3,
                        DEGREE * 4,
                        DEGREE * 5,
                        DEGREE * 10,
                        DEGREE * 15,
                        DEGREE * 20,
                        DEGREE * 30,
                        DEGREE * 40];
        this.DMS_COUNT = this.DMS_STEPS.length;

        DEGREE = 1.0;
        var TENTH = DEGREE / 10.0;
        var HUNDREDTH = DEGREE / 100.0;
        var THOUSANDTH = DEGREE / 1000.0;

        this.DEG_STEPS = [THOUSANDTH,
                         THOUSANDTH * 2.5,
                         THOUSANDTH * 5,
                         HUNDREDTH,
                         HUNDREDTH * 2.5,
                         HUNDREDTH * 5,
                         TENTH,
                         TENTH * 2.5,
                         TENTH * 5,
                         DEGREE,
                         DEGREE * 2,
                         DEGREE * 3,
                         DEGREE * 4,
                         DEGREE * 5,
                         DEGREE * 10,
                         DEGREE * 15,
                         DEGREE * 20,
                         DEGREE * 20,
                         DEGREE * 30,
                         DEGREE * 40];
        this.DEG_COUNT = this.DEG_STEPS.length;

        if(DMS){
            this.STEPS = this.DMS_STEPS;
            this.STEP_COUNT = this.DMS_COUNT;
        } else {
            this.STEPS = this.DEG_STEPS;
            this.STEP_COUNT = this.DEG_COUNT;
        }
        this.DMS = DMS;
        this.maxLines = maxLines;
        //Cesium Scene
        this.scene = scene;
        this.proj = scene.mapProjection;
        this.refresh_scale();
        this.linePoolSize = 50;
        this.$labelContainer = $(containerName);
        this.initLines();
        this.initLabels();
        this.on = true;
        this._prevCamPos = this.scene.camera.position.clone();
        this.prevOffLat = this.prevOffLon = 0;
        this.color = new Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK.withAlpha(0.65));
        this.dirty = false;
    };

    Graticule.prototype = {

        activate: function() {
            this.on = true;
            this.scene.postRender.addEventListener(this.refreshGraticule, this);
            this.dirty=true;
            if (!this.scene.primitives.contains(this.lines)){
                this.scene.primitives.add(this.lines);
            }
            this.refreshGraticule();
        },
        deactivate: function() {
            this.on = false;
            $('.graticule-label').hide();
            this.lines.show = false;
            this.scene.postRender.removeEventListener(this.refreshGraticule, this);
        },

        setColor: function(color) {
            if(!color) {
                this.color = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLACK.withAlpha(0.65));
            } else {
                this.color = Cesium.ColorGeometryInstanceAttribute.fromColor(color);
            }
            this.dirty = true;
        },

        intDivFunc: function(a, b) {
            //integer division
            return a / b >= 0 ? Math.floor(a/b) : Math.ceil(a/b);
        },

        get_step_size: function(reference_size) {
            /*
            Chooses the interval size for the graticule, based on where the
            reference size fits into the STEPS table.

            :param reference_size: the approximate size you want in decimal degrees
            */
            for(var i = 0; i < this.STEP_COUNT; i++) {
                if(this.STEPS[i] > reference_size) {
                    return this.STEPS[i];
                }
            }
            //ref_size is bigger than 40 Degrees
            return this.STEPS[this.STEP_COUNT-1];
        },

        get_frustum_dimensions: function() {
            /*
            Helper function to get the lon/lat dimensions of the frustum. Returns a Cesium.Cartographic
            */
            var frustum = this.scene.camera.frustum;

            var center = this.scene.camera.position;
            var camheight = center.z - (frustum.right - frustum.left) * 0.5;
            var bl = new Cesium.Cartesian3(center.x - frustum.right, center.y - frustum.top, 0);
            var tr = new Cesium.Cartesian3(center.x - frustum.left, center.y - frustum.bottom, 0);
            if(tr.x < bl.x) {
                bl.x = bl.x - this.scene.mapProjection.project(new Cesium.Cartesian3.fromDegreesArray([360,0]));
            }
            this.offsetPoint = this.scene.mapProjection.unproject(new Cesium.Cartesian3(bl.x, bl.y, 0));
            var dims = new Cesium.Cartesian3(tr.x - bl.x, tr.y - bl.y, 0);
            return this.scene.mapProjection.unproject(dims);
        },
        refresh_scale: function() {
            /*
            Recomputes the interval and number of lines in each dimension.
            This should be called whenever the viewport changes.
            */
            if(this.maxLines === 0) {
                return;
            }
            var img_width = this.scene.canvas.clientWidth;
            var img_height = this.scene.canvas.clientHeight;

            var center = this.scene.camera.position;
            center = this.scene.mapProjection.unproject(new Cesium.Cartesian3(center.x, center.y, 0));
            this.ref_dim = img_width >= img_height ? 'w' : 'h';
            var ratio = img_width / img_height;
            if (Cesium.Math.toDegrees(Math.abs(center.latitude)) > 30) {
                ratio = ratio /1.5;
            }

            if(this.ref_dim === 'w'){
                this.lon_lines = this.maxLines;
                this.lat_lines = Math.round(this.lon_lines / ratio);
            }
            if(this.ref_dim === 'h'){
                this.lat_lines = this.maxLines;
                this.lon_lines = Math.round(this.lat_lines * ratio);
            }
            var dims = this.get_frustum_dimensions();

            var width = Cesium.Math.toDegrees(dims.longitude);
            var height = Cesium.Math.toDegrees(dims.latitude);

            if(this.currentIntervalLon === this.get_step_size(width / this.lon_lines)) {
                this.changed_scale = true;
            }

            this.currentIntervalLon = this.get_step_size(width / this.lon_lines);
            this.currentIntervalLat = this.get_step_size(height/ this.lat_lines);
        },

        initLines: function() {
            if (!this.lines) {
                this.lines = new Cesium.PrimitiveCollection();
            }
        },

        initLabels: function() {
            if (!this.labels) {
                this.labels = [];
                var $div;
                for (var i=0; i < this.linePoolSize; i++) {
                    $div = $("<div>", {"class": "graticule-label"});
                    this.$labelContainer.prepend($div);
                    $div.text("" + i);
                    $div.css({"top": i*20 + "px"});
                    //$div.hide();
                    //$div.click(function(){ /* ... */ });
                    this.labels.push($div);
                }
            }
        },

        setupLines: function() {

            var frustum = this.scene.camera.frustum;
            var center = this.scene.camera.position;
            var offsetPoint = new Cesium.Cartesian3(center.x - frustum.right, center.y - frustum.top, 0);
            offsetPoint = this.scene.mapProjection.unproject(new Cesium.Cartesian3(offsetPoint.x, offsetPoint.y, 0));

            var ciLon = this.currentIntervalLon;
            var ciLat = this.currentIntervalLat;
            var intDivFunc = this.intDivFunc;

            var offLon = Cesium.Math.toDegrees(offsetPoint.longitude);
            offLon = (intDivFunc(offLon, ciLon) - 8) * ciLon;
            var offLat = Cesium.Math.toDegrees(offsetPoint.latitude);
            offLat = (intDivFunc(offLat, ciLat) - 8) * ciLat;

            if ((Math.abs(offLon - this.prevOffLon) < 3*this.currentIntervalLon && 
                Math.abs(offLat - this.prevOffLat) < 3*this.currentIntervalLat) &&
                !this.dirty){
                return;
            } else {
                this.prevOffLon = offLon;
                this.prevOffLat = offLat;
            }
            this.lines.removeAll();

            var topDist = Math.min((this.lat_lines + 9) * ciLat, 90-offLat);
            this.lon_geo=[];
            var pts;
            for( var i=0; i < (this.lon_lines + 10); i++ ) {
                pts = [i * ciLon + offLon, Math.max(Math.min(offLat, 89),-89),
                    i * ciLon + offLon, Math.max(Math.min(offLat + topDist/2, 89),-89),
                    i * ciLon + offLon, Math.max(Math.min(topDist + offLat, 89),-89)
                ];
                this.lon_geo.push(new Cesium.GeometryInstance({
                                geometry: new Cesium.SimplePolylineGeometry({
                                    positions: Cesium.Cartesian3.fromDegreesArray(pts),
                                    arcType: Cesium.ArcType.RHUMB
                                }),
                                attributes: {
                                    color: this.color
                                },
                                allowPicking: false
                            }));
            }
            this.lon_prim = this.lines.add(new Cesium.Primitive({
                geometryInstances: this.lon_geo,
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: false
                })
            }));
            // adds the latitude lines (south to north)
            this.lat_geo = [];
            for( var j=0;j < (this.lat_lines + 10); j++ ) {
                if (j * ciLat + offLat > 90) {
                    //stop if you pass the pole
                    break;
                }
                var linelat = Math.max(Math.min(j * ciLat + offLat, 89),-89);
                var latLinePoints = [-180, linelat, 0, linelat, 180, linelat];
                this.lat_geo.push(new Cesium.GeometryInstance({
                                geometry: new Cesium.SimplePolylineGeometry({
                                    positions: Cesium.Cartesian3.fromDegreesArray(latLinePoints),
                                    arcType: Cesium.ArcType.RHUMB
                                }),
                                attributes: {
                                    color: this.color
                                },
                                allowPicking: false
                            }));
            }
            this.lat_prim = this.lines.add(new Cesium.Primitive({
                geometryInstances: this.lat_geo,
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: false
                })
            }));
        },

        refreshGraticule: _.throttle(function() {
            if(!this._prevCamPos.equals(this.scene.camera.position) || this.dirty) {
                this.refresh_scale();
                this.setupLines();
                this.setupLabels();
                this.lines.raiseToTop(this.lat_prim);
                this.lines.raiseToTop(this.lon_prim);
                this.scene.primitives.raiseToTop(this.lines);
                //this.scene.primitives.raiseToTop(this.labels);
                this._prevCamPos = this.scene.camera.position.clone();
                this.dirty = false;
            }
        },32),

        setupLabels : function() {
            var frustum = this.scene.camera.frustum;
            var center = this.scene.camera.position;
            var bottomPos = center.y - frustum.top;
            var intDivFunc = this.intDivFunc;

            var genLabel = this.DMS ? this.genDMSLabel : this.genDegLabel;
            var line, label, linePos, labelPosition;
            for(var i=0; i < (this.lon_lines + 10); i++) {
                line = this.lon_geo[i].geometry;
                label = this.labels[i];
                linePos = line._positions[0];
                var lineLon = Cesium.Ellipsoid.WGS84.cartesianToCartographic(line._positions[0]).longitude;
                labelPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.scene, linePos);
                label.text(this.DMS ? this.genDMSLabel('lon', lineLon) : this.genDegLabel('lon', lineLon));
                label.css("bottom", 0 + "px");
                label.css("top", "");
                label.css("left", (labelPosition.x - label.width()/2) + "px");
                if(this.on){
                    label.show();
                }
            }
            i--;
            for(var j=0;j < this.lat_geo.length; j++) {
                //if (!this.linegeo[j]) {
                    //console.trace();
                //}
                line = this.lat_geo[j].geometry;
                label = this.labels[i+j];
                linePos = line._positions[0];
                var lineLat = Cesium.Ellipsoid.WGS84.cartesianToCartographic(line._positions[0]).latitude;
                labelPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.scene, linePos);
                label.text(this.DMS ? this.genDMSLabel('lat', lineLat) : this.genDegLabel('lat', lineLat));
                label.css("bottom", "");
                label.css("top", (labelPosition.y - label.height()/2) + "px");
                label.css("left", "0px");
                if(this.on){
                    label.show();
                }
            }
            j--;
            for (var k = j + i; k < this.linePoolSize; k++) {
                this.labels[k].hide();
            }
        },
        genDMSLabel: function(dim, radians) {
            var tot_seconds = Math.abs(Math.round(radians/Cesium.Math.RADIANS_PER_ARCSECOND));
            var seconds = tot_seconds % 60;
            var minutes = this.intDivFunc(tot_seconds % 3600, 60);
            var degrees = this.intDivFunc(tot_seconds, 3600);
            var hemi = 'N';
            if (dim ==='lon') {
                hemi = radians > 0 ? 'E' : 'W';
            } else {
                hemi = radians > 0 ? 'N' : 'S';
            }
            if(seconds) {
                return degrees + '\xB0' + minutes + '\'' + seconds + '" ' + hemi;
            } else if (minutes) {
                return degrees + '\xB0' + minutes + '\' ' + hemi;
            } else {
                return degrees + '\xB0 ' + hemi;
            }
        },
        genDegLabel: function(dim, radians) {
            var deg = Cesium.Math.toDegrees(radians);
            var hemi = 'N';
            if (dim ==='lon') {
                hemi = radians > 0 ? 'E' : 'W';
            } else {
                hemi = radians > 0 ? 'N' : 'S';
            }
            return ('' + Math.abs(deg).toFixed(3)).slice(-8) + '\xB0 ' + hemi;
        }
    };
    return Graticule;
});
