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
            'click th': 'sortTable'
        },

        initialize: function(obj){
            this.oilLib = new OilLib();
            this.oilLib.on('ready', this.setReady, this);
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

        sortTable: function(e){
            this.oilLib.sortOils(e.target.className);
        }

    });
    return oilTableView;
});