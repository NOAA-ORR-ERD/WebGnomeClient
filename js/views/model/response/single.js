define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'raphael',
    'views/base',
    'text!templates/model/response/single.html',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
    'flotpie',
    'flotfillarea',
    'flotneedle',
], function($, _, Backbkone, moment, Raphael, BaseView, SingleTemplate){
    var singleBurnView = BaseView.extend({
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
                    timeformat: "%Y/%m/%d",
                    minTickSize: [1, "day"]
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
                    lineWidth: 1
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
                    }
                }
            },
            legend: {
                position: 'nw'
            }
        },

        initialize: function(options){
            this.response_name = !_.isUndefined(options.response_name) ? options.response_name : '';
            this.process = !_.isUndefined(options.process) ? options.process : '';
            this.dataset = options.dataset;
        },

        formatNeedleLabel: function(text, n){
            var num = parseFloat(parseFloat(text).toPrecision(2)).toString();
            var units = webgnome.model.get('spills').at(0).get('units');
            
            return num + ' ' + units;
        },

        render: function(){
            if(_.isUndefined(this.graph)){
                this.$el.html(_.template(SingleTemplate, {
                    name: this.response_name,
                    process: this.process,
                    units: webgnome.model.get('spills').at(0).get('units')
                }));
                this.graph = $.plot('.canvas', this.pluckDataset(this.dataset, ['burned']), this.chart_options);
            } else {
                this.graph.setData(this.pluckDataset(this.dataset, ['burned']));
                this.graph.setupGrid();
                this.graph.draw();
            }
            this.renderTimeline();
        },

        pluckDataset: function(dataset, leaves){
            return _.filter(dataset, function(set){
                return leaves.indexOf(set.name) !== -1;
            });
        },

        renderTimeline: function(){
            if(_.isUndefined(this.paper)){
                this.paper = Raphael(this.$('.timeline')[0]);
                this.drawTimelineLegend();
            }
            var paper = this.paper;
            
             // new guide
            // var lines = max_width / this.calculator.get('optime');
            // var grid = Array();
            // for(var i=0; i<lines; i++){
            //     grid[i] = Array();
            //     // grid[i]['line'] = paper.path('M'+lines*i+' 110L'+lines*i+' 450');
            //     // grid[i]['line'].attr('stroke', '#ddd');
            //     if(i != 0 && i != this.calculator.get('optime')){
            //         grid[i]['label'] = paper.text(lines*i, 95, i);
            //         grid[i]['label'].attr('fill', '#999');
            //     }
            // }

            // var x = 0;
            // var y = 120;
            // var ratio = ((parseFloat(this.calculator.get('optime'))) * 60) / parseInt(max_width);
            // var results = this.calculator.get('results');

            // for(var l=0; l<this.calculator.get('limit'); l++){

            //     var fill = (parseFloat(results[l][5].value) * 60) / ratio;
            //     var tran = parseFloat(results[l][6].value) / ratio;
            //     var burn = parseFloat(results[l][8].value) / ratio;
            //     var residue = parseFloat(this.calculator.get('burn_residue') * 60) / ratio;
                
            //     var i = 0;
            //     do{
            //         var draw_skim = paper.rect(x, y, fill, 15);
            //         draw_skim.attr('fill', 'green');
            //         draw_skim.attr('stroke-width', '0');
            //         draw_skim.attr('stroke', 'white');

            //         x += fill;

            //         var draw_transit = paper.rect(x, y, tran, 15);
            //         draw_transit.attr('fill', 'orange');
            //         draw_transit.attr('stroke-width', '0');
            //         draw_transit.attr('stroke', 'white');

            //         x += tran;

            //         var draw_unload = paper.rect(x, y, burn, 15);
            //         draw_unload.attr('fill', 'red');
            //         draw_unload.attr('stroke-width', '0');
            //         draw_unload.attr('stroke', 'white');

            //         x += burn;

            //         var draw_residue = paper.rect(x, y, residue, 15);
            //         draw_residue.attr('fill', 'black');
            //         draw_residue.attr('stroke-width', '0');
            //         draw_residue.attr('stroke', 'white');

            //         x += residue;

            //         var draw_transit = paper.rect(x, y, tran, 15);
            //         draw_transit.attr('fill', 'orange');
            //         draw_transit.attr('stroke-width', '0');
            //         draw_transit.attr('stroke', 'white');

            //         x += tran;
            //         i++;
            //     } while (x <= max_width);

            //     // label iteration timeline
            //     if(parseInt(this.calculator.get('limit')) === 1){
            //         var draw_label = paper.text(0, y - 8, 'Each Operating Period');
            //     } else {
            //         var thickness;
            //         switch (l){
            //             case 0:
            //                 thickness = '0.1';
            //                 break;
            //             case 1:
            //                 thickness = '0.05';
            //                 break;
            //             case 2:
            //                 thickness = '0.025';
            //                 break;
            //         }

            //         var draw_label = paper.text(0, y - 8, 'Operating Period '+ parseInt(l + 1) + ' | ' + thickness + ' in');
            //     }

            //     draw_label.attr('text-anchor', 'start');

            //     x = 0;
            //     y += 15 + 15;
            // }
        },

        drawTimelineLegend: function(){
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

            // Guide
            // Guide hour label
            var draw_guidehourlabel = paper.text(max_width / 2, 75, 'Operating Period [hrs]');
            //  Guide times
            var draw_guidestartlabel = paper.text(3, 95, '0');
            draw_guidestartlabel.attr('fill', '#999');
            var draw_guideendlabel = paper.text(max_width - 6, 95, this.calculator.get('optime'));
            draw_guideendlabel.attr('fill', '#999');
        },

        close: function(e){
            if(!_.isUndefined(e)){
                e.preventDefault();
            }
            this.trigger('close');
            BaseView.prototype.close.call(this);
        }
    });

    return singleBurnView;
});