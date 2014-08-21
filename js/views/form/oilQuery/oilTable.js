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
            'click th': 'headerClick'
        },

        initialize: function(obj){
            this.oilLib = new OilLib();
            this.oilLib.on('ready', this.setReady, this);
            this.on('sort', this.setReady);
            this.filter = obj;
        },

        setReady: function(){
            var oils = this.oilLib;
            if(this.filter){
                oils = oils.whereCollection(this.filter);
            }
            var compiled = _.template(OilTableTemplate, {data: oils});
            this.$el.html(compiled);
            this.ready = true;
            this.trigger('ready');
        },

        headerClick: function(e){
            var ns = e.target.className,
                cs = this.oilLib.sortAttr;

            if (ns == cs){
                this.oilLib.sortDir *= -1;
            } else {
                this.oilLib.sortDir = 1;
            }

            this.oilLib.sortOils(ns);
            this.trigger('sort');
        }

    });
    return oilTableView;
});