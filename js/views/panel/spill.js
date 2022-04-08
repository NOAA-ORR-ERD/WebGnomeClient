define([
    'jquery',
    'underscore',
    'backbone',
    'nucos',
    'moment',
    'views/default/swal',
    'model/spill/spill',
    'model/spill/gnomeoil',
    'text!templates/panel/spill.html',
    'text!templates/panel/time-check-popover.html',
    'views/panel/base',
    'views/form/spill/type',
    'views/form/spill/continue',
    'views/form/spill/spatial',
    'views/form/oil/library',
    'flot',
    'flottime',
    'flotresize',
    'flotstack',
], function($, _, Backbone, nucos, moment, swal,
            SpillModel, GnomeOil, SpillPanelTemplate, TimeCheckPopoverTemplate, BasePanel,
            SpillTypeForm, SpillContinueView, SpillSpatialView, OilLibraryView) {
    var spillPanel = BasePanel.extend({
        className: 'col-md-3 spill object panel-view',

        events: _.defaults({
            //'click .substance-info': 'renderOilLibrary',
            //'click .substance-info .edit': 'renderOilLibrary',
            'click input[id="spill_active"]': 'spill_active',
        }, BasePanel.prototype.events),

        models: [
            'gnome.spills.spill.Spill'
        ],

        initialize: function(options) {
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('spills'), 'add remove change',
                          this.rerender);
        },

        new: function() {
            var spillTypeForm = new SpillTypeForm();
            spillTypeForm.render();

            spillTypeForm.on('hidden', spillTypeForm.close);
            spillTypeForm.on('select', _.bind(function(form) {
                form.on('wizardclose', form.close);
                form.on('save', _.bind(function(model) {
                    webgnome.model.get('spills').add(model);
                    webgnome.model.save(undefined, {
                        success: function(){webgnome.model.get('spills').trigger('sync', model);}
                    });

                    if(form.$el.is(':hidden')) {
                        form.close();
                    }
                    else {
                        form.once('hidden', form.close, form);
                    }
                }, this));
            }, this));
        },

        edit: function(e) {
            e.stopPropagation();
            var id = this.getID(e);
            var spill = webgnome.model.get('spills').get(id);
            if (_.isUndefined(spill)) {
                return;
            }
            var spillView;
            if (spill.get('release').get('obj_type') === 'gnome.spills.release.NESDISRelease') {
                spillView = new SpillSpatialView({edit:true}, spill);
            } else {
                spillView = new SpillContinueView(null, spill);
            }

            spillView.on('save', function() {
                spillView.on('hidden', spillView.close);
            });

            spillView.on('wizardclose', spillView.close);

            spillView.render();
        },

        spill_active: function(e) {
            e.stopPropagation();

            var active = e.target.checked;
            var id = this.getID(e);
            var spill = webgnome.model.get('spills').get(id);

            spill.set('on',active);

            webgnome.model.save();
        },

        render: function() {
            var spills = webgnome.model.get('spills');

            spills.forEach(function(spill) {
                spill.isValid();
            });

            var spillArray = this.calculateSpillAmount();

            var numOfTimeSteps = webgnome.model.get('num_time_steps');
            var timeStep = webgnome.model.get('time_step');

            var substance = webgnome.model.getSubstance();
            var compiled;

            if (substance.get('is_weatherable')) {
                compiled = _.template(SpillPanelTemplate)({
                    spills: spills.models,
                    substance: substance,
                    categories: substance.parseCategories(),
                });
            }
            else {
                compiled = _.template(SpillPanelTemplate)({
                    spills: spills.models,
                    substance: substance,
                    categories: [],
                });
            }

            this.$el.html(compiled);

            if (spills.models.length > 0) {
                this.$el.addClass('complete');
                this.$el.removeClass('col-md-3').addClass('col-md-6');
                this.$('.panel-body').show();

                var dataset = [];

                for (var spill in spills.models) {
                    if (!_.isNull(spills.models[spill].validationError)) {
                        continue;
                    }

                    var data = [];
                    var start_time = moment(webgnome.model.get('start_time'),
                                            'YYYY-MM-DDTHH:mm:ss');

                    for (var i = 0; i < numOfTimeSteps; i++) {
                        var date = start_time.add(timeStep, 's').unix() * 1000;
                        var amount = spillArray[spill][i];

                        data.push([parseInt(date, 10), parseInt(amount, 10)]);
                    }

                    dataset.push({
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
                        id: spills.models[spill].get('id')
                    });
                }

                if (!_.isUndefined(dataset)) {
                    this.spillDataset = dataset;

                    setTimeout(_.bind(function() {
                        this.renderSpillRelease(dataset);
                    }, this), 1);
                }
            }
            else {
                this.$('.panel').removeClass('complete');
                this.$('.panel-body').hide().html('');
                this.$el.removeClass('col-md-6').addClass('col-md-3');
            }

            BasePanel.prototype.render.call(this);
        },
/*
        setupTooltips: function(options) {
            
            BasePanel.prototype.setupTooltips.call(this, options);
            var delay = options && options.delay ? options.delay : {show:500, hide: 100};
            this.$('.time-check').popover({
                html: true,
                content: function(){ //this == the span the popover is attached to
                    var id_ = $(this).parents('.single').attr('data-id');
                    var spill = webgnome.model.get('spills').findWhere({id: id_});
                    var validInfo = spill.timeValidStatusGenerator();
                    var rv = $('<div>');
                    rv.append($('<div class="ttmsg">').text(validInfo.msg))
                    rv.append($('<div class="ttinfo">').text(validInfo.info))
                    if (validInfo.valid !== 'valid'){
                        rv.append($('<div class="ttcorr">').text('Double click to ' + validInfo.corrDesc))
                    }
                    return rv[0].outerHTML;
                },
                template: TimeCheckPopoverTemplate.substring(1, TimeCheckPopoverTemplate.length-1), //DIRTY HACK to remove grave chars
                container: 'body',
                delay: delay,
                trigger: 'hover',
                placement: 'auto top'
            });
        },

        timeValidDblClick: function(e) {
            //fires the time interval corrective function, if any available;
            var id_ = $(e.currentTarget).parents('.single').attr('data-id');
            var spill = webgnome.model.get('spills').findWhere({id: id_});
            validInfo = spill.timeValidStatusGenerator();
            if (!_.isUndefined(validInfo.correction)){
                validInfo.correction();
            }
        },
*/
        renderSpillRelease: function(dataset) {
            this.spillPlot = $.plot('.spill .chart .canvas', dataset, {
                grid: {
                    borderWidth: 1,
                    borderColor: '#ddd',
                    hoverable: true
                },
                xaxis: {
                    mode: 'time',
                    timezone: 'browser',
                    tickColor: '#ddd'
                },
                yaxis: {
                    tickColor: '#ddd'
                },
                tooltip: false,
                tooltipOpts: {
                    content: function(label, x, y, flotItem) { return "Time: " + moment(x).calendar() + "<br>Amount: " + y ;}
                },
                shifts: {
                    x: -30,
                    y: -50
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
                },
                needle: false
            });
        },

//         renderOilLibrary: function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//             //this will be bugged
//             var substance = new GnomeOil();
//             var oilLib = new OilLibraryView({}, substance);
// 
//             oilLib.on('save wizardclose', _.bind(function() {
//                 if (oilLib.$el.is(':hidden')) {
//                     oilLib.close();
//                     webgnome.model.setGlobalSubstance(substance);
//                 }
//                 else {
//                     oilLib.once('hidden', oilLib.close, oilLib);
//                 }
//             }, this));
// 
//             oilLib.render();
//         },

        calculateSpillAmount: function() {
            var oilAPI;
            var oilconvert = new nucos.OilQuantityConverter();
            var spills = webgnome.model.get('spills');

            if (spills.length > 0 &&
                    spills.at(0).get('substance')) {
                oilAPI = spills.at(0).get('substance').api;
            }

            oilAPI = oilAPI ? oilAPI : 10;

            var units = spills.models.length ? spills.at(0).get('units') : '';
            var timeStep = webgnome.model.get('time_step');
            var numOfTimeSteps = webgnome.model.get('num_time_steps');

            var start_time = moment(webgnome.model.get('start_time'),
                                    'YYYY-MM-DDTHH:mm:ss');
            var data = {};

            for (var j = 0; j < spills.models.length; j++) {
                var releaseTime = moment(spills.models[j].get('release').get('release_time'),
                                         'YYYY-MM-DDTHH:mm:ss').unix();
                var endReleaseTime = moment(spills.models[j].get('release').get('end_release_time'),
                                            'YYYY-MM-DDTHH:mm:ss').unix();
                var timeDiff = endReleaseTime - releaseTime;

                var spillUnits = spills.models[j].get('units');
                var amount = 0;
                var amountArray = [];

                for (var i = 0; i < numOfTimeSteps; i++) {
                    var upperBound = moment(start_time).add(i * timeStep, 's').unix();
                    var lowerBound = upperBound - timeStep;

                    if (releaseTime >= lowerBound &&
                            endReleaseTime < upperBound &&
                            timeDiff <= timeStep && i < numOfTimeSteps) {
                        amount += spills.models[j].get('amount');
                    }
                    else if (timeDiff > timeStep) {
                        var rateOfRelease = spills.models[j].get('amount') / timeDiff;

                        if (releaseTime >= lowerBound &&
                                endReleaseTime >= upperBound &&
                                releaseTime <= upperBound) {
                            var head = (upperBound - releaseTime);
                            amount += rateOfRelease * head;
                        }
                        else if (releaseTime <= lowerBound &&
                                 endReleaseTime >= upperBound) {
                            amount += rateOfRelease * timeStep;
                        }
                        else if (releaseTime <= lowerBound &&
                                 endReleaseTime <= upperBound &&
                                 endReleaseTime >= lowerBound) {
                            var tail = endReleaseTime - lowerBound;
                            amount += rateOfRelease * tail;
                        }
                    }

                    amountArray.push(amount);
                }

                for (var o = 0; o < amountArray.length; o++) {
                    amountArray[o] = oilconvert.Convert(amountArray[o],
                                                        spillUnits,
                                                        oilAPI,
                                                        "API degree",
                                                        units);
                }

                data[j] = amountArray;
            }

            return data;
        },

        hover: function(e) {
            if ($(e.target).attr('id') !== 'substanceInfo') {
                var id = $(e.target).data('id');

                if (_.isUndefined(id)) {
                    id = $(e.target).parents('.single').data('id');
                }

                var coloredSet = [];

                for (var dataset in this.spillDataset) {
                    var ds = _.clone(this.spillDataset[dataset]);

                    if (this.spillDataset[dataset].id !== id) {
                        ds.color = '#ddd';
                    }

                    coloredSet.push(ds);
                }

                this.spillPlot.setData(coloredSet);
                this.spillPlot.draw();
            }
        },

        unhover: function() {
            this.spillPlot.setData(this.spillDataset);
            this.spillPlot.draw();
        },

        delete: function(e) {
            e.stopPropagation();

            var id = this.getID(e);
            var spill = webgnome.model.get('spills').get(id);

            swal.fire({
                title: 'Delete "' + spill.get('name') + '"',
                text: 'Are you sure you want to delete this spill?',
                icon: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(deleteSpill) {
                if (deleteSpill.isConfirmed) {
                    webgnome.model.get('spills').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },
    });

    return spillPanel;
});
