define([
    'jquery',
    'underscore',
    'views/base',
    'text!templates/cesium/toolbox.html',
    'views/cesium/tools/base_map_tool',
    'views/cesium/tools/measuring_tool'
], function ($, _, BaseView, ToolboxTemplate, BaseMapTool, MapMeasuringTool) {
    "use strict";
    var toolboxView = BaseView.extend({
        className: 'tools',
        options: function() {
            var opts = {
                defaultToolType: BaseMapTool,
                measureTool: true,
                pinTool: false,
                queryTool: false,
            };
            return opts;
        },
        events: {
            'click .tool': 'toggleTool',
            'click .title': 'toggleToolbox'
        },
        toolNames: {
            'MapMeasuringTool': MapMeasuringTool,
        },
        defaultWidth: '50px',

        initialize: function(options, cesiumView){
            if (_.isUndefined(options)) {
                options = {};
            }
            BaseView.prototype.initialize.call(this, options);
            _.defaults(options, this.options());
            this.options = options;

            this.cesiumView = cesiumView;
            this.defaultTool = new this.options.defaultToolType(this.cesiumView);
            this.defaultTool.activate();
            this.currentTool = this.defaultTool;
            this.listenTo(this, 'toggleExpand', this.toggleToolbox);
        },

        render: function() {
            //Render HTML
            var tmpl = _.template(ToolboxTemplate);
            this.$el.html(tmpl({options: this.options}));
            var tools = this.$('.tool');
            for (var i = 0; i < tools.length; i++) {
                if (this.toolNames[tools[i].name]) {
                    $(tools[i]).tooltip(this.toolNames[tools[i].name].genToolTip(this.el)   );
                }
            }
            this.$el.css('height', this.$el.siblings('.tab-container').css('width'));
        },

        toggleToolbox: function(){
            this.$el.toggleClass('expanded');
            if (this.$('.tool-enabled').length > 0 ) {
                this.$('.tool-enabled').removeClass('tool-enabled');
                this.currentTool.deactivate();
                this.currentTool = this.defaultTool;
                this.defaultTool.activate();
            }
        },
        toggleTool: function(e) {
            var tgt = $(e.currentTarget);
            if (tgt.hasClass('tool-enabled')) { //disabling active tool
                tgt.removeClass('tool-enabled');
                this.currentTool.deactivate();
                this.currentTool = this.defaultTool;
                this.defaultTool.activate();
            } else {
                var activeButtons = this.$('.tool-enabled');
                if (activeButtons.length > 0) { //different tool currently active
                    activeButtons.removeClass('tool-enabled');
                }
                tgt.addClass('tool-enabled');
                this.currentTool.deactivate();
                var newTool = new this.toolNames[e.currentTarget.name](this.cesiumView);
                this.currentTool = newTool;
                this.currentTool.activate();
            }
        }
    });
    return toolboxView;
});