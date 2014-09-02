define([
    'jquery',
    'underscore',
    'backbone',
    'model/resources/oilLib',
    'text!templates/default/oilTable.html',
    'text!templates/default/oilRow.html'
], function($, _, Backbone, OilLib, OilTableTemplate, OilRowTemplate){
    var oilTableView = Backbone.View.extend({
        id: 'tableContainer',
        ready: false,
        events: {
            'click th': 'headerClick',
            'click td': 'oilSelect'
        },
        sortUpIcon: '&#9650;',
        sortDnIcon: '&#9660;',
        activeIcon: null,

        initialize: function(obj){
            this.oilLib = new OilLib();
            this.oilLib.on('ready', this.setReady, this);
            this.on('sort', this.sortTable);
        },

        setReady: function(){
            var oils = this.oilLib;
            var compiled = _.template(OilTableTemplate, {data: oils});
            this.$el.html(compiled);
            this.appendCaret();
            this.ready = true;
            this.trigger('ready');
        },

        sortTable: function(){
            var oils = this.oilLib;
            var compiled = _.template(OilTableTemplate, {data: oils});
            this.$el.html(compiled);
            this.appendCaret();
            this.trigger('renderTable');
        },

        appendCaret: function(){
             if (this.oilLib.sortDir === 1){
                this.activeIcon = this.sortUpIcon;
            } else {
                this.activeIcon = this.sortDnIcon;
            }
            this.$('.' + this.oilLib.sortAttr + ' span').html(this.activeIcon);
        },

        render: function(){
            var oils = this.oilLib;
            var compiled = _.template(OilTableTemplate, {
                data: oils
            });
            $('#tableContainer').html(this.$el.html(compiled));
            this.trigger('sort');
        },

        headerClick: function(e){
            var ns = e.target.className,
                cs = this.oilLib.sortAttr;

            if (ns == cs){
                this.oilLib.sortDir *= -1;
            } else {
                this.oilLib.sortDir = 1;
            }

            $(e.currentTarget).closest('thead').find('span').empty();

            this.oilLib.sortOils(ns);
            this.trigger('sort');
        }

    });
    return oilTableView;
});