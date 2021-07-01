define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'views/panel/base',
    'model/weatherers/manual_beaching',
    'views/form/beached',
    'text!templates/panel/beached.html',
    'sweetalert'
], function($, _, Backbone, moment, BasePanel, BeachedModel, BeachedForm, BeachedPanelTemplate, swal){
    var beachedPanel = BasePanel.extend({
        className: 'col-md-3 beached object panel-view',

        models: [
            'gnome.weatherers.manual_beaching.Beaching'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('weatherers'), 'add change remove', this.rerender);
        },

        new: function(){
            var beached = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.manual_beaching.Beaching'});
            if (_.isUndefined(beached) || beached.length === 0){
                beached = new BeachedModel();
            }
            var beachedForm = new BeachedForm({}, beached);
            beachedForm.on('hidden', beachedForm.close);
            beachedForm.on('save', _.bind(function(){
                if(beached.get('timeseries').length === 0){
                    webgnome.model.get('weatherers').remove(beached);
                } else {
                    webgnome.model.get('weatherers').add(beached, {merge: true});
                }
                webgnome.model.save(null, {validate: false});
            }, this));
            if (webgnome.model.get('map').get('obj_type') !== 'gnome.maps.map.MapFromBNA') {
                beachedForm.render();
            } else {
                swal({
                    title: "A shoreline is defined for the model",
                    text: "This form is intended for entering in shoreline oil stranding information when a shoreline map has not been defined for the model. If a shoreline has been defined, the model will compute the beached oil.",
                    type: "warning"
                });
                beachedForm.render();
            }
        },

        render: function(){
            var beached = webgnome.model.get('weatherers').findWhere({obj_type: 'gnome.weatherers.manual_beaching.Beaching'});
            var compiled = _.template(BeachedPanelTemplate)({
                timeseries: beached ? beached.get('timeseries') : [],
                date: beached ? moment(beached.get('timeseries')[0][0]).format(webgnome.config.date_format.moment) : '',
                amount: beached ? beached.get('timeseries')[0][1] : '',
                units: beached ? beached.get('units') : '',
            });

            this.$el.html(compiled);

            if (!_.isUndefined(beached) && beached.get('timeseries').length > 0){
                this.$('.panel').addClass('complete');
                var dataset;

                if (beached.get('timeseries').length === 1){
                    this.$el.removeClass('col-md-6').addClass('col-md-3');

                } else if (beached.get('timeseries').length > 1) {
                    var ts = beached.get('timeseries');
                    var data = [];
                    for (var entry in ts){
                        var date = moment(ts[entry][0], 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                        data.push([parseInt(date, 10), parseInt(ts[entry][1], 10)]);
                    }
                    dataset = [{
                        data: data,
                        color: '#9CD1FF',
                        hoverable: true,
                        lines: {
                            show: true,
                            fill: true
                        },
                        points: {
                            show: false
                        },
                        direction: {
                            show: false
                        }
                    }];

                    this.$el.removeClass('col-md-3').addClass('col-md-6');
                }
                this.$('.panel-body').show();

                if (dataset) {
                    setTimeout(_.bind(function(){
                        this.beachedPlot = $.plot('.beached .chart .canvas', dataset, {
                            grid: {
                                borderWidth: 1,
                                borderColor: '#ddd'
                            },
                            xaxis: {
                                mode: 'time',
                                timezone: 'browser',
                                tickColor: '#ddd'
                            },
                            series: {
                                stack: true,
                                group: true,
                                groupInterval: 1,
                                lines: {
                                    show: true,
                                    fill: true,
                                    lineWidth: 2
                                },
                                shadowSize: 0
                            }
                        });
                    }, this), 1);
                }
            } else {
                this.$el.removeClass('col-md-6').addClass('col-md-3');
                this.$('.panel').removeClass('complete');
                this.$('.panel-body').hide();
            }
            BasePanel.prototype.render.call(this);
        }
    });

    return beachedPanel;
});