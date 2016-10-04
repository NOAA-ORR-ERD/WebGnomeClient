define([
    'underscore',
    'jquery',
    'backbone',
    'views/panel/base',
    'model/environment/wind',
    'model/movers/wind',
    'views/form/wind',
    'text!templates/panel/wind.html',
    'nucos',
    'moment',
    'sweetalert',
    'flot',
    'flottime',
    'flotresize',
    'flotdirection',
    'jqueryui/widgets/sortable'
], function(_, $, Backbone, BasePanel, WindModel, WindMoverModel, WindForm, WindPanelTemplate, nucos, moment, swal){
    var windPanel = BasePanel.extend({
        className: 'col-md-3 wind panel-view object',

        models: [
            'gnome.environment.wind.Wind'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('environment'), 'change add remove', this.rerender);
        },

        new: function(){
            var wind = new WindModel();
            var windForm = new WindForm(null, wind);
            windForm.on('hidden', windForm.close);
            windForm.on('save', _.bind(function(){
                var windMover = new WindMoverModel({wind: wind});
                webgnome.model.get('movers').add(windMover);
                webgnome.model.get('environment').add(wind);
            }, this));
            windForm.render();
        },

        edit: function(e){
            e.stopPropagation();
            var id = this.getID(e);

            var wind = webgnome.model.get('environment').get(id);
            var windForm = new WindForm(null, wind);
            windForm.on('hidden', windForm.close);

            windForm.render();
        },

        render: function(){
            var winds = _.union(
                webgnome.model.get('environment').where({obj_type: 'gnome.environment.wind.Wind'})
                // webgnome.model.get('movers').where({obj_type: 'gnome.movers.wind_movers.GridWindMover'})
            );

            var compiled = _.template(WindPanelTemplate, {
                winds: winds,
                units: winds.length > 0 ? winds[0].get('units') : ''
            });

            this.$el.html(compiled);

            if(winds.length > 0){
                var dataset = this.generateDataset(winds);

                this.$el.removeClass('col-md-3').addClass('col-md-6');

                if(dataset){
                    // set a time out to wait for the box to finish expanding or animating before drawing
                    this.dataset = dataset;
                    setTimeout(_.bind(function(){
                        this.plot = $.plot(this.$('.chart .canvas'), dataset, {
                            grid: {
                                borderWidth: 1,
                                borderColor: '#ddd'
                            },
                            xaxis: {
                                mode: 'time',
                                timezone: 'browser',
                                tickColor: '#ddd'
                            },
                            yaxis: {
                                tickColor: '#ddd'
                            }
                        });
                    }, this), 2);
                }

                this.$('.panel-body').show();

                this.$('.list').sortable({
                    update: _.bind(this.order, this)
                });
            } else {
                this.$el.removeClass('col-md-6').addClass('col-md-3');
                this.$('.panel').removeClass('complete');
                this.$('.panel-body').hide().html('');
            }
            BasePanel.prototype.render.call(this);
        },

        delete: function(e){
            e.stopPropagation();
            var id = $(e.target).parents('.single').data('id');
            var wind = webgnome.model.get('environment').get(id);

            swal({
                title: 'Delete "' + wind.get('name') + '"',
                text: 'Are you sure you want to delete this wind?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed){
                if(isConfirmed){
                    var movers = webgnome.model.get('movers').filter(function(model){
                        if(model.get('wind') && model.get('wind').get('id') === id){
                            return true;
                        }
                        return false;
                    });

                    webgnome.model.get('movers').remove(movers);
                    webgnome.model.get('environment').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },

        order: function(){
            // simple find first wind after sort and move it to the top of the environment list
            // doesn't support full sorting of all wind objects.
            var collection = webgnome.model.get('environment');
            var first_id = this.$('.list .single:first').data('id');

            var wind = collection.get(first_id);
            collection.remove(wind, {silent: true});
            collection.unshift(wind);
            webgnome.model.save();
        },

        generateDataset: function(winds){
            var dataset = [];
            var unit = winds[0].get('units');
            for(var w in winds){
                var wind = winds[w];
                var ts = wind.get('timeseries');
                var data = [];
                var raw_data = [];
                var rate = Math.round(ts.length / 24);
                
                for (var entry in ts){
                    var date = moment(ts[entry][0], 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
                    var speed = nucos.convert('Velocity', wind.get('units'), unit, parseFloat(ts[entry][1][0]));

                    if(rate === 0 ||  entry % rate === 0){
                        data.push([parseInt(date, 10), speed, parseInt(ts[entry][1][1], 10) - 180]);
                    }
                    raw_data.push([parseInt(date, 10), speed, parseInt(ts[entry][1][1], 10) - 180]);
                }

                var lines = true;
                if (ts.length > 24){
                    lines = false;
                }

                dataset.push({
                    data: data,
                    color: 'rgba(151,187,205,1)',
                    hoverable: true,
                    shadowSize: 0,
                    lines: {
                        show: lines,
                        lineWidth: 2
                    },
                    direction: {
                        show: true,
                        openAngle: 40,
                        color: '#7a7a7a',
                        fillColor: '#7a7a7a',
                        arrawLength: 5
                    },
                    id: wind.get('id')
                });

                if (ts.length > 24){
                    dataset.push({
                        data: raw_data,
                        color: 'rgba(151,187,205,1)',
                        hoverable: true,
                        shadowSize: 0,
                        lines: {
                            show: true,
                            lineWidth: 2
                        },
                        direction: {
                            show: false
                        },
                        id: wind.get('id')
                    });
                }
            }
            return dataset;
        }
    });

    return windPanel;
});