define([
    'jquery',
    'underscore',
    'backbone',
    'cesium',
    'views/base',
    'module',
    'text!templates/default/legend.html',
    'moment',
], function ($, _, Backbone, Cesium, BaseView, module, LegendTemplate, moment) {
    "use strict";
    var legendView = BaseView.extend({
        className: 'legend',
        events: {
            'click .title': 'toggleLegendPanel',
            'click .legend-edit-btn': 'render'
        },

        initialize: function(options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            this.render();
            if(webgnome.hasModel() && this.modelMode !== 'adios'){
                this.modelListeners();
            }
        },

        render: function() {
            //Render HTML
            this.$el.html(_.template(LegendTemplate,
                                     {model: webgnome.model,
                                      legend: this
                                     }
            ));
        },

        toggleLegendPanel: function(){
            this.$el.toggleClass('expanded');
        },

        modelListeners: function(){
            this.listenTo(webgnome.model.get('movers'), 'change', this.render);
            this.listenTo(webgnome.model.get('environment'), 'change', this.render);
            this.listenTo(webgnome.model.get('spills'), 'change', this.render);
            this.listenTo(webgnome.model, 'change', this.render);
        },

        genSpillLegendItem(spill) {
            var item = $('<tr></tr>');
            var row = $('<tr></tr>');
            var appearance = spill.get('_appearance');
            var colormap = appearance.get('colormap');
            var numColors = 1;
            if (colormap.get('map_type') === 'discrete') {
                numColors = colormap.get('colorScaleRange').length;
            }
            row.append($('<th class="spill-row-name" rowspan=' + numColors + '>'+ spill.get('name') +'</th>'));
            var color = colormap.get('colorScaleRange')[0]
            row.append($('<td class="spill-color-bucket" style="background-color: '+ color +'"><span>'+ '0-100' +'</span></td>'));
            item.append(row)
            for (var i = 1; i < numColors; i++) {
                color = colormap.get('colorScaleRange')[i]
                item.append($('<tr><td class="spill-color-bucket" style="background-color: '+ color +'"><span>'+ '0-100' +'</span></td></tr>'));
            }
            return item[0].outerHTML;
        }

    });
    return legendView;
});