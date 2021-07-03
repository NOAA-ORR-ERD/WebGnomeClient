define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'sweetalert',
    'text!templates/panel/roc-response.html',
    'views/panel/base',
    'views/form/response/type',
    'views/form/response/roc_disperse',
    'views/form/response/roc_burn',
    'views/form/response/roc_skim',
    'flot',
    'flottime',
    'flotgantt',
], function($, _, Backbone, moment, swal,
            ResponsePanelTemplate, BasePanel, ResponseTypeForm,
            ResponseDisperseView,ResponseBurnView, ResponseSkimView) {
    var responsePanel = BasePanel.extend({
        className: 'col-md-3 response panel-view roc',

        models: [
            'gnome.model.Model',
            'gnome.weatherers.roc.Burn',
            'gnome.weatherers.roc.Disperse',
            'gnome.weatherers.roc.Skim'
        ],

        initialize: function(options) {
            BasePanel.prototype.initialize.call(this, options);

            this.listenTo(webgnome.model.get('weatherers'), 'change add remove', this.rerender);
            this.listenTo(webgnome.model, 'change:start_time change:duration', this.rerender);
        },

        new: function() {
            var typeForm = new ResponseTypeForm({className: 'modal form-modal responsetype-form roc'});

            typeForm.render();
            typeForm.on('hidden', typeForm.close);
        },

        render: function() {
            var weatherers = webgnome.model.get('weatherers').models;
            this.filter(weatherers);

            var compiled = _.template(ResponsePanelTemplate)({
                responses: this.responses
            });

            this.$el.html(compiled);

            if (this.responses.length > 0) {
                this.$('.panel').addClass('complete');
                this.$el.removeClass('col-md-3').addClass('col-md-6');
                this.$('.panel-body').show();
                this.$('.panel-body').css('padding-top','0px');
                // this.graphReponses(this.responses);
            }
            else {
                this.$('.panel').removeClass('complete');
                this.$('.panel-body').hide().html('');
                this.$el.removeClass('col-md-6').addClass('col-md-3');
            }
        },

        filter: function(weatherers) {
            var filteredNames = ["Disperse", "Skim", "Burn"];
            this.responses = [];

            for (var i = 0; i < weatherers.length; i++) {
                if (filteredNames.indexOf(weatherers[i].parseObjType()) !== -1 &&
                        !weatherers[i].get('name').startsWith("Burn")) {
                    this.responses.push(weatherers[i]);
                }
            }
        },

        graphReponses: function(responses) {
            var yticks = [];
            var dataset = [];

            var colors = {
                'gnome.weatherers.roc.Burn': '#CB4B4B',
                'gnome.weatherers.roc.Disperse': '#AFD8F8',
                'gnome.weatherers.roc.Skim': '#EDC240'
            };

            var t = responses.length;

            for (var i in responses) {
                this.modelStartTime = moment(webgnome.model.get('start_time'));
                var duration = webgnome.model.get('duration');
                this.modelEndTime = this.modelStartTime.clone().add(duration, 's');

                // clip any infinite times to the model time range
                /* jshint loopfunc: true */
                var [startTime, endTime] = responses[i].get('active_range').map(function(time) {
                    if (time === 'inf') {
                        return this.modelEndTime;
                    }
                    else if (time === '-inf') {
                        return this.modelStartTime;
                    }
                    else {
                        // TODO: should we clip any non-infinite times as well?
                        return moment(time);
                    }
                }, this).map(function(time) {
                    return time.unix() * 1000;                    
                });

                yticks.push([t, responses[i].get('name')]);

                dataset.push({
                    data: [[startTime, t, endTime, responses[i].get('id')]],
                    color: colors[responses[i].get('obj_type')],
                    lines: {
                        show: false,
                        fill: false
                    },
                    direction: {
                        show: false
                    },
                    id: responses[i].get('id')
                });
                t--;

            }

            if(!_.isUndefined(dataset)){
                this.responseDataset = dataset;
                setTimeout(_.bind(function(){
                    this.renderResponseGraph(dataset, yticks);
                }, this));
            }

        },

        renderResponseGraph: function(dataset, yticks){
            var start_time = moment(webgnome.model.get('start_time'), 'YYYY-MM-DDTHH:mm:ss').unix() * 1000;
            var numOfTimeSteps = webgnome.model.get('num_time_steps') - 1;
            var timeStep = webgnome.model.get('time_step');
            var end_time = moment.unix(start_time / 1000).add(numOfTimeSteps * timeStep, 's').unix() * 1000;
            this.responsePlot = $.plot(this.$('.chart .canvas'), dataset, {
                series: {
                    editMode: 'v',
                    editable: true,
                    gantt: {
                        active: true,
                        show: true,
                        barHeight: 0.5
                    }
                },
                grid: {
                    borderWidth: 1,
                    borderColor: '#ddd',
                    hoverable: true
                },
                xaxis: {
                    mode: 'time',
                    timezone: 'browser',
                    min: start_time,
                    max: end_time
                },
                yaxis: {
                    min: 0.5,
                    max: yticks.length + 0.5,
                    ticks: yticks
                },
                needle: false
            });
        },

        hover: function(e){
            return e; // no op for now;
            // var id = this.getID(e);

            // var coloredSet = [];
            // for(var dataset in this.responseDataset){
            //     var ds = _.clone(this.responseDataset[dataset]);
            //     if (this.responseDataset[dataset].id !== id){
            //         ds.color = '#ddd';
            //     }

            //     coloredSet.push(ds);
            // }
            // this.responsePlot.setData(coloredSet);
            // this.responsePlot.draw();
        },

        unhover: function(e){
            return e; // no op for now;
            // this.responsePlot.setData(this.responseDataset);
            // this.responsePlot.draw();
        },

        edit: function(e){
            e.stopPropagation();
            var responseId = this.getID(e);
            var response = webgnome.model.get('weatherers').get(responseId);
            var responseView;
            var nameArray = response.get('obj_type').split('.');
            switch (nameArray[nameArray.length - 1]){
                case "Disperse":
                    responseView = new ResponseDisperseView({model: response});
                    break;
                case "Burn":
                    responseView = new ResponseBurnView({model: response});
                    break;
                case "Skim":
                    responseView = new ResponseSkimView({model: response});
                    break;
            }

            responseView.on('save', _.bind(function(){
                responseView.on('hidden', responseView.close);
            }, this));
            responseView.on('wizardclose', responseView.close);
            responseView.render();
        },

        delete: function(e){
            e.stopPropagation();
            var id = this.getID(e);
            var response = webgnome.model.get('weatherers').get(id);
            swal({
                title: 'Delete "' + response.get('name') + '"',
                text: 'Are you sure you want to delete this response?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed){
                if(isConfirmed){
                    webgnome.model.get('weatherers').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },
    });

    return responsePanel;
});
