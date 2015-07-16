
(function($) {

    $.fn.relativeImportanceUI = function(options) {

        return this.each(function() {

            var settings = $.extend({}, $.fn.relativeImportanceUI.defaults, options);

            var canvas = this.__canvas = new fabric.Canvas($(this).attr('id'), { selection: false });
            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

            var pt1x = settings.centerx + settings.radius * Math.cos(3*Math.PI/2),
                pt1y = settings.centery + settings.radius * Math.sin(3*Math.PI/2);
            var pt2x = settings.centerx + settings.radius * Math.cos(Math.PI/6),
                pt2y = settings.centery + settings.radius * Math.sin(Math.PI/6);
            var pt3x = settings.centerx + settings.radius * Math.cos(5*Math.PI/6),
                pt3y = settings.centery + settings.radius * Math.sin(5*Math.PI/6);

            var line1 = makeLine([pt1x,  pt1y, settings.centerx, settings.centery], 'surface'),
                line2 = makeLine([settings.centerx, settings.centery, pt2x, pt2y], 'column'),
                line3 = makeLine([settings.centerx, settings.centery,  pt3x, pt3y], 'shoreline');

            canvas.add(line1, line2, line3);

            canvas.add( //makeTriangle(),
                        makeCircle(line1.get('x1'), line1.get('y1'), true, null,  line1, null, 'surface'),
                        makeCircle(line1.get('x2'), line1.get('y2'), true, line1, line2, line3, null),
                        makeCircle(line2.get('x2'), line2.get('y2'), true, line2, null,  null, 'column'),
                        makeCircle(line3.get('x2'), line3.get('y2'), true, line3, null,  null, 'shoreline')
            );

            canvas.on('object:moving', _.bind(movementUpdate , this));

            canvas.renderAll();

            function movementUpdate(e) {
                var p = e.target;
                p.l1 && p.l1.set({ 'x2': p.left, 'y2': p.top });
                p.l2 && p.l2.set({ 'x1': p.left, 'y1': p.top });
                p.l3 && p.l3.set({ 'x1': p.left, 'y1': p.top });
                canvas.renderAll();

                if (settings.callback != null) {
                    objs = {};
                    $.each(canvas._objects, function(idx, obj) {
                        if (obj.linename) {
                            objs[obj.linename] = Math.sqrt(((obj.x1-obj.x2)*(obj.x1-obj.x2)) + ((obj.y1-obj.y2)*(obj.y1-obj.y2)));
                        }
                    });
                    settings.callback(objs);
                }
            };

        });

    };

    $.fn.relativeImportanceUI.defaults = {
        centerx: 150,
        centery: 150,
        radius: 100,
        callback: null
    };

    //
    // PRIVATE functions for building UI
    //

    function makeCircle(left, top, s, l1, l2, l3, l) {
        var r = 1;
        if (l === null) r = 5;
        var c = new fabric.Circle({ strokeWidth: 5, radius: r, fill: '#fff', stroke: '#666', selectable: false });
        c.hasControls = c.hasBorders = false;

        var g = null;

        if (l !== null) {
            var t = new fabric.Text(l, { fontSize: 14, evented: false });
            g = new fabric.Group([c,t], { left: left + 2, top: top + 2, selectable: s });
        } else {
            g = new fabric.Group([c], { left: left, top: top, selectable: s });
        }

        g.hasControls = c.hasBorders = false;
        g.l1 = l1;
        g.l2 = l2;
        g.l3 = l3;

        return g;
    };

    function createWidget(circle){
        var group = new fabric.Group([makeTriangle(), circle]);
        group.item(0).set({
            width: 100 * Math.sqrt(3),
            height: 150,
            hasControls: false,
            hasRotatingPoint: false,
            stroke: 'black',
            fill: 'white',
            lockMovementX: true,
            lockMovementY: true
        });
        group.item(1).set({
            lockMovementY: false,
            lockMovementX: false
        });

        return group;
    }

    function makeTriangle() {
        var triangle = new fabric.Triangle({
            width: 100 * Math.sqrt(3),
            height: 150,
            hasControls: false,
            hasRotatingPoint: false,
            stroke: 'black',
            fill: 'white',
            lockMovementX: true,
            lockMovementY: true,
            left: 150,
            top: 125
        });

        return triangle;
    };

    function makeLine(coords, n) {
        var l = new fabric.Line(coords, { fill: 'red', stroke: 'red', strokeWidth: 5, selectable: false });
        l.linename = n;

        return l;
    };

})(jQuery);
