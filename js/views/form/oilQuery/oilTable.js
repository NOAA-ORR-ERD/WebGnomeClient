define([
    'jquery',
    'underscore',
    'backbone',
    'model/resources/oilLib',
    'text!templates/default/oilTable.html',
    'text!templates/default/oilRow.html'
], function($, _, Backbone, OilLib, OilTableTemplate, OilRowTemplate){
    var oilTableView = Backbone.View.extend({
        //className: 'oilTable',
        id: 'tableContainer',
        ready: false,

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

        setupRows: function(){
            var totalCompiled = '';
            var oils = this.oilLib;
            
            var compiled = _.template(OilRowTemplate, {data: oils});

            return compiled;
        },

    });
    return oilTableView;
});