define([
    'jquery',
    'underscore',
    'moment',
    'backbone',
    'text!templates/timeseries/start_stop.html',
    'text!templates/timeseries/start_stop_entry.html',
    'jqueryDatetimepicker'
], function($, _, moment, Backbone, Template, EntryTemplate){
    var StartStopTimeseriesView = Backbone.View.extend({
        className: 'col-md-12 timeseries start_stop',

        events:{
            'click input[type="checkbox"]': 'toggleOnscene'
        },

        initialize: function(options){
            Backbone.View.prototype.initialize.call(options, this);
            this.timeseries = this.model.get('timeseries');
            this.render();
        },

        render: function(){
            var model_start = moment(webgnome.model.get('start_time'));
            var model_end = moment(webgnome.model.get('start_time')).add(webgnome.model.get('duration'), 's');
            var days = moment.duration(model_end.unix() - model_start.unix(), 'seconds').days();

            this.$el.html(_.template(Template)());
            var iter_date = model_start.clone();
            for(var d = 0; d < days; d++){
                var hasData = this.model.applies(iter_date.format('Y-M-D'));
                if(hasData !== -1){
                    // the model has an entry for the day we're rendering 
                    // fill data in.
                    var start = moment(this.timeseries[hasData][0]);
                    var end = moment(this.timeseries[hasData][1]);
                    this.$('.panel-body').append(_.template(EntryTemplate)({
                        day: start.format('YYYY-M-D'),
                        index: d,
                        tsindex: hasData
                    }));
                    this.$('#slider' + d).slider({
                        range: true,
                        min: 0,
                        max: 96,
                        values: [
                            (start.format('H') * 60 / 15) + (start.format('m') / 15), 
                            (end.format('H') * 60 / 15) + (end.format('m') / 15)],
                        slide: _.bind(this.updateSlide, this)
                    });
                    this.$('.entry' + d + ' .ui-slider-handle:first').html(
                        '<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + start.format('h:mm A') + '</div></div>'
                    );

                    this.$('.entry' + d + ' .ui-slider-handle:last').html(
                        '<div class="tooltip bottom slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + end.format('h:mm A') + '</div></div>'
                    );
                } else {
                    // if the model doesn't have data for the day
                    // present a "disabed" slider concept
                    this.$('.panel-body').append(_.template(EntryTemplate)({
                        day: iter_date.format('YYYY-M-D'),
                        index: d,
                        tsindex: null
                    }));
                }
                iter_date.add(1, 'day');
            }
        },

        updateSlide: function(e, ui){
            var index = this.$(e.target).parents('.entry').data('tsindex');
            var start = this.timeseries[index][0];
            var stop = this.timeseries[index][1];

            this.timeseries[index][0] = start.split('T')[0] + 'T' + this.quarterToTime(ui.values[0]);
            this.timeseries[index][1] = stop.split('T')[0] + 'T' + this.quarterToTime(ui.values[1]);
            this.$(e.target).parents('.entry').find('.tooltip:first .tooltip-inner').text(moment(this.timeseries[index][0]).format('h:mm A'));
            this.$(e.target).parents('.entry').find('.tooltip:last .tooltip-inner').text(moment(this.timeseries[index][1]).format('h:mm A'));
        },

        toggleOnscene: function(e){
            var index = this.$(e.target).parents('.entry').data('tsindex');
            var toggle = this.$(e.target).parents('.entry').find('input[type="checkbox"]:checked').length > 0 ? true : false;

            if(toggle){
                // toggled an entry on so add it
                var date = moment(this.$(e.target).data('date'));
                var insert = this.model.chronoIndex(date.format('Y-M-D'));
                this.timeseries.splice(insert, 0, [date.format('YYYY-MM-DD') + 'T07:00:00', date.format('YYYY-MM-DD') + 'T19:00:00' ]);
            } else {
                // toggled an entry off so remove it
                this.timeseries.splice(index, 1);
            }

            this.render();
        },

        quarterToTime: function(quarter){
            var decimal = (quarter * 15 / 60).toString();
            var hour = ~~decimal < 10 ? '0' + ~~decimal: ~~decimal;
            var min = ('.' + decimal.split('.')[1]) * 60;

            // special case for 2400 hours
            if(hour === 24){
                hour = 23;
                min = 59;
            }

            return min ? hour + ':' + min : hour + ':00';
        },

        close: function(){
            Backbone.View.prototype.close.call(this);
            $('.xdsoft_datetimepicker:last').remove();
        }
    });

    return StartStopTimeseriesView;
});