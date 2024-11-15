define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/help',
    'views/modal/help'
], function($, _, Backbone, HelpView, HelpModal) {
    'use strict';
    var baseView = Backbone.View.extend({

        events: {
            'click .gnome-help': 'renderHelp'
        },

        initialize: function(options){
            if (this.module) {
                this.help = new HelpView({path: this.module.id, context: 'view'});
            }
            Backbone.View.prototype.initialize.call(this, options);
            if (options) {
                if (options.el) {
                    this.el = options.el;
                    this.$el = $(options.el);
                }
                if (options.$el) {
                    this.$el = options.$el;
                    this.el = options.$el[0];
                }
            }
        },

        render: function(){
            if(this.module){
                if(this.help.ready){
                    this.showHelp();
                } else {
                    this.help.on('ready', this.showHelp, this);
                }
            }
        },

        renderHelp: function(options){
            options = _.defaults(options, {
                help: this.help
            });
            var modal = new HelpModal(options);
            modal.render();
        },       
        
        genTimeZoneSelect: function() {
            var selbox = $('<select></select>',{'class':'form-control form-control-sm', 'name':'timeoffset', 'id':'timeoffset', 'style':'font-size:0.85em;'});
            for (var i = 0; i < this.timeOffsetOptions.length; i++) {
                var timeoffset = webgnome.model.get('timezone_offset').offset;
                var value = this.timeOffsetOptions[i].offset;
                var sel_text = this.timeOffsetOptions[i].offset_string + ' [' + this.timeOffsetOptions[i].title + ']';
                if (_.isNull(value)) {
                    var option = $('<option value=""></option>');
                    option.text(this.timeOffsetOptions[i].title);
                } else {
                    var option = $('<option></option>',{'value':value});
                    option.text(sel_text);
                }
               
                if (this.timeOffsetOptions[i].offset === timeoffset) {
                    option.attr('selected','selected');
                }
               selbox.append(option);
                
            }
            return selbox[0].outerHTML;
        },
              

        timeOffsetOptions: [
            {
                offset: null,
                offset_string: '',
                title: 'No Timezone Specified',
            },
            {
                offset: -12,
                offset_string: '-12:00',
                title: 'Pacific/Wallis',
            },
            {
                offset: -11,
                offset_string: '-11:00',
                title: 'Pacific/Pago_Pago',
            },
            {
                offset: -10,
                offset_string: '-10:00',
                title: 'US/Hawaii',
            },
            {
                offset: -9,
                offset_string: '-09:00',
                title: 'US/Alaska',
            },
            {
                offset: -8,
                offset_string: '-08:00',
                title: 'US/Pacific, US/Alaska Daylight',
            },
            {
                offset: -7,
                offset_string: '-07:00',
                title: 'US/Mountain, US/Pacific Daylight',
            },
            {
                offset: -6,
                offset_string: '-06:00',
                title: 'US/Central, US/Mountain Daylight',
            },
            {
                offset: -5,
                offset_string: '-05:00',
                title: 'US/Eastern, US/Central Daylight',
            },
            {
                offset: -4,
                offset_string: '-04:00',
                title: 'Canada/Atlantic, US/Eastern Daylight',
            },
            {
                offset: -3,
                offset_string: '-03:00',
                title: 'America/Sao_Paulo, Canada/Atlantic Daylight',
            },
            {
                offset: -2,
                offset_string: '-02:00',
                title: 'America/Noronha',
            },
            {
                offset: -1,
                offset_string: '-01:00',
                title: 'Atlantic/Azores',
            },
            {
                offset: 0,
                offset_string: '+00:00',
                title: 'UTC',
            },
            {
                offset: 1,
                offset_string: '+01:00',
                title: 'Europe/Amsterdam',
            },
            {
                offset: 2,
                offset_string: '+02:00',
                title: 'Europe/Athens, Europe/Amsterdam Daylight',
            },
            {
                offset: 3,
                offset_string: '+03:00',
                title: 'Europe/Moscow, Europe/Athens Daylight',
            },
            {
                offset: 4,
                offset_string: '+04:00',
                title: 'Asia/Dubai',
            },
            {
                offset: 5,
                offset_string: '+05:00',
                title: 'Asia/Tashkent',
            },
            {
                offset: 6,
                offset_string: '+06:00',
                title: 'Asia/Dhaka',
            },
            {
                offset: 7,
                offset_string: '+07:00',
                title: 'Asia/Bangkok',
            },
            {
                offset: 8,
                offset_string: '+08:00',
                title: 'Asia/Manila',
            },
            {
                offset: 9,
                offset_string: '+09:00',
                title: 'Asia/Tokyo',
            },
            {
                offset: 10,
                offset_string: '+10:00',
                title: 'Pacific/Port_Moresby',
            },
            {
                offset: 11,
                offset_string: '+11:00',
                title: 'Pacific/Guadalcanal',
            },
            {
                offset: 12,
                offset_string: '+12:00',
                title: 'Pacific/Wake',
            }
        ]

    });

    return baseView;
});
