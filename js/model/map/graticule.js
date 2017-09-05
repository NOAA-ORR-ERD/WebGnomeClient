var Graticule = function (DMS, scene, maxLines) {

    var DEGREE = 1.0
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

    DEGREE = 1.0
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
    this.linePoolSize = 40
    this.initLines();
    this.initLabels();
    this.on = false;
    this._prevCamPos = this.scene.camera.position.clone()
};

Graticule.prototype = {
    
    activate: function() {
        this.on = true;
        this.scene.postRender.addEventListener(this.refreshGraticule, this);
    },
    deactivate: function() {
        this.on = false;
        var i = 0;
        if(this.lines) {
            for(i = 0; i < this.linePoolSize; i++) {
                this.lines.get(i).show = false;
            }
        }
        if(this.labels) {
            for(i = 0; i < this.linePoolSize; i++) {
                this.labels.get(i).show = false;
            }
        }
        this.scene.camera.percentChanged=0.5
        this.scene.postRender.removeEventListener(this.refreshGraticule, this);
    },

    intDivFunc: function(a, b) {
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
        Helper function to convert the relative frustum coordinates into absolute lon/lat coordinates
        returns an array of Cartesian3, organized as [bl, tl, tr, br]
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

        this.currentIntervalLon = this.get_step_size(width / this.lon_lines);
        this.currentIntervalLat = this.get_step_size(height/ this.lat_lines);
    },

    initLines: function() {
        if (!this.lines) {
            this.lines = this.scene.primitives.add(new Cesium.PolylineCollection());
            var material = Cesium.Material.fromType('Color');
            material.uniforms.color = Cesium.Color.BLACK;
            material.translucent = false;
            for(var i=0; i < this.linePoolSize; i++) {
                this.lines.add({positions : Cesium.Cartesian3.fromDegreesArray([i,i,i+1,i+1]),
                                followSurface : true,
                                show: false,
                                material : material,
                                width : 1});
            }
        }
    },
    
    initLabels: function() {
        if (!this.labels) {
            this.labels = this.scene.primitives.add(new Cesium.LabelCollection());
            this.labels.blendOption = Cesium.BlendOption.OPAQUE
            for (var i=0; i < this.linePoolSize; i++) {
                this.labels.add({
                    positions: Cesium.Cartesian3.fromDegreesArray([i,i,i+1,i+1]),
                    show: false,
                    font: '18px Helvetica',
                    text: 'undef',
                    fillColor: Cesium.Color.DARKGRAY,
                    backgroundColor: new Cesium.Color(1.0,1.0,1.0,0),
                    outlineWidth: 0,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    });
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
        offLon = (intDivFunc(offLon, ciLon) - 2) * ciLon;
        var offLat = Cesium.Math.toDegrees(offsetPoint.latitude);
        offLat = (intDivFunc(offLat, ciLat) - 2) * ciLat;

        var topDist = Math.min((this.lat_lines + 3) * ciLat, 90-offLat);
        var rightDist = (this.lon_lines + 3) * ciLon;

        for(var i=0; i < (this.lon_lines + 4); i++) {
            this.lines.get(i).positions = Cesium.Cartesian3.fromDegreesArray([i * ciLon + offLon, Math.max(Math.min(offLat, 90),-90),
                                                                              i * ciLon + offLon, Math.max(Math.min(offLat + topDist/2, 90),-90),
                                                                              i * ciLon + offLon, Math.max(Math.min(topDist + offLat, 90),-90)]);
            this.lines.get(i).show = true;
        }
        for(var j=0;j < (this.lat_lines + 4); j++) {
            if (j * ciLat + offLat > 90) {
                break;
            }
            this.lines.get(i+j).positions = Cesium.Cartesian3.fromDegreesArray([offLon, Math.max(Math.min(j * ciLat + offLat, 90),-90),
                                                                                offLon + rightDist/2, Math.max(Math.min(j * ciLat + offLat, 90),-90),
                                                                                offLon + rightDist, Math.max(Math.min(j * ciLat + offLat, 90),-90)]);
            this.lines.get(i+j).show = true;
        }
        for (var k = i+j; k < this.linePoolSize; k++) {
            this.lines.get(k).show = false;
        }
    },

    refreshGraticule: function() {
        if(!this._prevCamPos.equals(this.scene.camera.position)) {
            this.refresh_scale();
            this.setupLines();
            this.setupLabels();
            this.scene.primitives.lowerToBottom(this.lines);
            this.scene.primitives.lowerToBottom(this.labels);
            this._prevCamPos = this.scene.camera.position.clone()
        }
    },

    setupLabels : function() {
        var frustum = this.scene.camera.frustum;
        var center = this.scene.camera.position;
        var bl = this.scene.mapProjection.unproject(new Cesium.Cartesian3(center.x - frustum.right, center.y - frustum.top, 0));
        var intDivFunc = this.intDivFunc

        var genLabel = this.DMS ? this.genDMSLabel : this.genDegLabel
        for(var i=0; i < (this.lon_lines + 4); i++) {
            var line = this.lines.get(i);
            var label = this.labels.get(i);
            var lineLon = Cesium.Ellipsoid.WGS84.cartesianToCartographic(line.positions[0]).longitude
            label.position = Cesium.Cartesian3.fromRadians(lineLon, bl.latitude);
            label.text = this.DMS ? this.genDMSLabel('lon', lineLon) : this.genDegLabel('lon', lineLon);
            label.show = true;
        }
        for(var j=0;j < (this.lat_lines + 4); j++) {
            var line = this.lines.get(i+j);
            var label = this.labels.get(i+j);
            var lineLat = Cesium.Ellipsoid.WGS84.cartesianToCartographic(line.positions[0]).latitude
            label.position = new Cesium.Cartesian3.fromRadians(bl.longitude, lineLat);
            label.text = this.DMS ? this.genDMSLabel('lat', lineLat) : this.genDegLabel('lat', lineLat);
            label.show = true;
        }
        for (var k = i+j; k < this.linePoolSize; k++) {
            this.labels.get(k).show = false;
        }
    },
    genDMSLabel: function(dim, radians) {
        var tot_seconds = Math.round(radians/Cesium.Math.RADIANS_PER_ARCSECOND);
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
            return degrees + '\xB0 ' + minutes + '\' ' + seconds + '" ' + hemi;
        } else if (minutes) {
            return degrees + '\xB0 ' + minutes + '\' ' + hemi;
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
        return deg + '&#8451; ' + hemi;
    }
}