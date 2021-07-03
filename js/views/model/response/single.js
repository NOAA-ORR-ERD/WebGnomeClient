define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'raphael',
    'nucos',
    'views/base',
    'text!templates/model/response/single.html',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
    'flotpie',
    'flotfillarea',
    'flotneedle',
], function($, _, Backbone, moment, Raphael, nucos, BaseView, SingleTemplate){
    var singleBaseView = BaseView.extend({
        className: 'single',

        events: {
            'click .back': 'close'
        },

        chart_options: {
            grid: {
                borderWidth: 1,
                borderColor: '#ddd',
                hoverable: true,
            },
            xaxes: [
                {
                    position: 'bottom',
                    mode: 'time',
                    timezone: 'browser',
                    timeformat: "%m/%d %H:%M",
                    minTickSize: [1, "hour"]
                },
                {
                    position: 'top',
                    mode: 'time',
                    timezone: 'browser',
                    timeformat: "%H:%M"
                }
            ],
            series: {
                lines: {
                    show: true,
                    lineWidth: 1,
                    fill: true
                },
                shadowSize: 0
            },
            yaxis: {},
            needle: {
                on: false,
                stack: false,
                noduplicates: true,
                label: this.formatNeedleLabel,
                x_tooltip: {
                    formatX: function(text){
                        var unix_time = parseInt(text, 10);
                        return moment(unix_time).format(webgnome.config.date_format.moment);
                    },
                }
            },
            legend: {
                position: 'nw'
            }
        },

        initialize: function(options){
            this.weatherer = !_.isUndefined(options.weatherer) ? options.weatherer : '';
            this.process = !_.isUndefined(options.process) ? options.process : '';
            this.dataset = options.dataset;
            this.colors = options.colors;
        },

        formatNeedleLabel: function(text, n){
            var num = parseFloat(parseFloat(text).toPrecision(2)).toString();
            var units = webgnome.model.get('spills').at(0).get('units');
            
            return num + ' ' + units;
        },

        render: function(){
            if(_.isUndefined(this.graph)){
                this.$el.html(_.template(SingleTemplate)({
                    name: this.weatherer.get('name'),
                    process: this.process,
                    units: webgnome.model.get('spills').at(0).get('units')
                }));
                this.graph = $.plot('.canvas', this.formatData(), this.chart_options);
            } else {
                this.graph.setData(this.formatData());
                this.graph.setupGrid();
                this.graph.draw();
            }
            this.renderTimeline();
        },

        formatData: function(){
            var dataset = [];
            var density = webgnome.model.get('spills').at(0).get('substance').get('standard_density');
            var units = webgnome.model.get('spills').at(0).get('units');
            var converter = new nucos.OilQuantityConverter();

            for(var i = 0; i < webgnome.cache.inline.length; i++){
                var ts = parseInt(moment(webgnome.cache.inline[i].get('WeatheringOutput').time_stamp).format('x'), 10);
                var amount = converter.Convert(webgnome.cache.inline[i].get('WeatheringOutput').nominal.systems[this.weatherer.get('id')][this.process], 'kg', density, 'kg/m^3', units);
                dataset.push([
                    ts,
                    amount
                ]);
            }
            return [{
                label: this.process,
                data: dataset
            }];
        },

        renderTimeline: function(){
            if(_.isUndefined(this.paper)){
                this.paper = Raphael(this.$('.timeline')[0]);
                switch(this.process){
                    case 'burned':
                        this.drawBurnLegend();
                        break;
                    case 'dispersed':
                        this.drawDisperseLegend();
                        break;
                    case 'skimmed':
                        this.drawSkimLegend();
                        break;
                }
                this.renderHourLabels();
            }
            var paper = this.paper;
            var x = 0;
            var y = 120;
            var max_width = this.$('.timeline').css('width').replace('px', '');
            var ratio = max_width / (webgnome.model.get('time_step') * webgnome.model.get('num_time_steps') );

            for(var i = 0; i < webgnome.cache.inline.length; i++){
                var step = webgnome.cache.inline[i];
                var output = step.get('WeatheringOutput');
                var system = output.nominal.systems[this.weatherer.get('id')];
                var step_t = 0;
                if(system.state.length > 0){
                    // is active this time step
                    for(var s = 0; s < system.state.length; s++){
                        var active = this.paper.rect(x, y, system.state[s][1] * ratio, 30);
                        active.attr('fill', this.colors[system.state[s][0]]);
                        active.attr('stroke-width', '0');
                        x += system.state[s][1] * ratio;
                        step_t += system.state[s][1];
                    }
                    if (step_t < webgnome.model.get('time_step')) {
                        var time_remaining = webgnome.model.get('time_step') - step_t;
                        var left = this.paper.rect(x, y, time_remaining * ratio, 30);
                        left.attr('fill', 'gray');
                        left.attr('stroke-width', '0');
                        x += time_remaining * ratio;
                        step_t += time_remaining;
                    }
                } else {
                    // not active this time step
                    var inactive = this.paper.rect(x, y, webgnome.model.get('time_step') * ratio, 30);
                    inactive.attr('fill', 'gray');
                    inactive.attr('stroke-width', '0');
                    x += webgnome.model.get('time_step') * ratio;
                }
            }
        },

        drawDisperseLegend: function(){
            var paper = this.paper;
            var max_width = this.$('.timeline').css('width').replace('px', '');
            var max_height = this.$('.timeline').css('height').replace('px', '');

            // title
            var title = paper.text(max_width / 2, 10, 'Dispersant Spraying Cycle Timeline');
            title.attr({'font-size': 20});
            title.attr({'font-weight': 'bold'});

            // legend
            var center = max_width / 2;
            var legend_width = 390;
            var draw_legendbox = paper.rect(center - 210, 25 + 10, legend_width, 25);

            // draw the swatches of color and text labels
            var cascade_legend = paper.rect(center - (legend_width / 2) + 5, 30 + 10, 15, 15);
            cascade_legend.attr('fill', 'purple');
            cascade_legend.attr('stroke', 'white');
            // label skim
            var cascade_legend_label = paper.text(center - (legend_width / 2) + 25, 37 + 10, 'Cascade Time');
            cascade_legend_label.attr({'text-anchor': 'start'});

            var transit_legend = paper.rect(center - (legend_width / 2) + 100, 30 + 10, 15, 15);
            transit_legend.attr('fill', 'rgba(0, 112, 220, 0.85)');
            transit_legend.attr('stroke', 'white');
            // label transit
            var transit_legend_label = paper.text(center - (legend_width / 2) + 120, 37 + 10, 'Transit Time');
            transit_legend_label.attr({'text-anchor': 'start'});
            
            var spray_legend = paper.rect(center - (legend_width / 2) + 184, 30 + 10, 15, 15);
            spray_legend.attr('fill', 'green');
            spray_legend.attr('stroke', 'white');
            // label offload
            var spray_legend_label = paper.text(center - (legend_width / 2) + 204, 37 + 10, 'Time on Site');
            spray_legend_label.attr({'text-anchor': 'start'});

            var reload_legend = paper.rect(center - (legend_width / 2) + 270, 30 + 10, 15, 15);
            reload_legend.attr('fill', 'orange');
            reload_legend.attr('stroke', 'white');
            var reload_legend_label = paper.text(center - (legend_width / 2) + 290, 37 + 10, 'Reload Time');
            reload_legend_label.attr({'text-anchor': 'start'});
        },

        drawBurnLegend: function(){
            var paper = this.paper;
            var max_width = this.$('.timeline').css('width').replace('px', '');
            var max_height = this.$('.timeline').css('height').replace('px', '');

            // title
            var title = paper.text(max_width / 2, 10, 'Burn Cycle Timeline');
            title.attr({'font-size': 20});
            title.attr({'font-weight': 'bold'});

            // legend
            var center = max_width / 2;
            var legend_width = 418;
            var draw_legendbox = paper.rect(center - 210, 25 + 10, legend_width, 25);

            // draw the swatches of color and text labels
            var fill_legend = paper.rect(center - (legend_width / 2) + 5, 30 + 10, 15, 15);
            fill_legend.attr('fill', 'green');
            fill_legend.attr('stroke', 'white');
            // label skim
            var fill_legend_label = paper.text(center - (legend_width / 2) + 25, 37 + 10, 'Fill Time');
            fill_legend_label.attr({'text-anchor': 'start'});

            var offset_legend = paper.rect(center - (legend_width / 2) + 77, 30 + 10, 15, 15);
            offset_legend.attr('fill', 'orange');
            offset_legend.attr('stroke', 'white');
            // label transit
            var offset_legend_label = paper.text(center - (legend_width / 2) + 97, 37 + 10, 'Offset Time');
            offset_legend_label.attr({'text-anchor': 'start'});
            
            var burn_legend = paper.rect(center - (legend_width / 2) + 158, 30 + 10, 15, 15);
            burn_legend.attr('fill', 'red');
            burn_legend.attr('stroke', 'white');
            // label offload
            var burn_legend_label = paper.text(center - (legend_width / 2) + 178, 37 + 10, 'Burn Time');
            burn_legend_label.attr({'text-anchor': 'start'});

            var residue_legend = paper.rect(center - (legend_width / 2) + 233, 30 + 10, 15, 15);
            residue_legend.attr('fill', 'black');
            residue_legend.attr('stroke', 'white');
            var residue_legend_label = paper.text(center - (legend_width / 2) + 253, 37 + 10, 'Burn Residue Processing Time (1h)');
            residue_legend_label.attr({'text-anchor': 'start'});
        },

        drawSkimLegend: function(){
            var paper = this.paper;
            var max_width = this.$('.timeline').css('width').replace('px', '');
            var max_height = this.$('.timeline').css('height').replace('px', '');

            var title = paper.text(max_width / 2, 10, 'Recovery Cycle Timeline');
            title.attr({'font-size': 20});
            title.attr({'font-weight': 'bold'});

            var center = max_width / 2;
            var legend_width = 267;
            var draw_legendbox = paper.rect(center - 133, 25 + 10, legend_width, 25);

            // draw the swatches of color and text labels
            var draw_legendskim = paper.rect(center - (legend_width / 2) + 5, 30 + 10, 15, 15);
            draw_legendskim.attr('fill', 'green');
            draw_legendskim.attr('stroke', 'white');
            // label skim
            var draw_legendskimlabel = paper.text(center - (legend_width / 2) + 25, 37 + 10, 'Skim Time');
            draw_legendskimlabel.attr({'text-anchor': 'start'});

            var draw_legendtransit = paper.rect(center - (legend_width / 2) + 77, 30 + 10, 15, 15);
            draw_legendtransit.attr('fill', 'red');
            draw_legendtransit.attr('stroke', 'white');
            // label transit
            var draw_legendtransitlabel = paper.text(center - (legend_width / 2) + 97, 37 + 10, 'Transit Time');
            draw_legendtransitlabel.attr({'text-anchor': 'start'});
            
            var draw_legendoffload = paper.rect(center - (legend_width / 2) + 158, 30 + 10, 15, 15);
            draw_legendoffload.attr('fill', 'orange');
            draw_legendoffload.attr('stroke', 'white');
            // label offload
           var draw_legendoffloadlabel = paper.text(center - (legend_width / 2) + 178, 37 + 10, 'Offload/Rig Time');
            draw_legendoffloadlabel.attr({'text-anchor': 'start'});
        },

        renderHourLabels: function(){
            var paper = this.paper;
            var max_width = this.$('.timeline').css('width').replace('px', '');

            // Guide
            // Guide hour label
            var draw_guidehourlabel = paper.text(max_width / 2, 75, 'Operating Period [hrs]');
            //  Guide times
            var draw_guidestartlabel = paper.text(3, 95, '0');
            draw_guidestartlabel.attr('fill', '#999');
            var draw_guideendlabel = paper.text(max_width - 6, 95, Math.round(webgnome.model.get('duration') / 60 / 60));
            draw_guideendlabel.attr('fill', '#999');

            // new guide
            var spacing = max_width / (webgnome.model.get('duration') / 60 / 60);
            var lines = webgnome.model.get('duration') / 60 / 60;
            var grid = Array();
            for(var i=0; i<lines; i++){
                grid[i] = Array();
                // grid[i]['line'] = paper.path('M'+lines*i+' 110L'+lines*i+' 450');
                // grid[i]['line'].attr('stroke', '#ddd');
                if(i !== 0){
                    grid[i].label = paper.text(spacing*i, 95, i);
                    grid[i].label.attr('fill', '#999');
                }
            }
        },

        close: function(e){
            if(!_.isUndefined(e)){
                e.preventDefault();
            }
            this.trigger('close');
            BaseView.prototype.close.call(this);
        }
    });

    return singleBaseView;
});