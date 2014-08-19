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
        filter: {location: 'SAUDI ARABIA'},

        initialize: function(obj) {
            this.$el.empty();
            this.oilLib = new OilLib(_.bind(this.setReady,this));
            //this.filter = obj;
        },

        setReady: function(){
            this.ready = true;
            var oilRows = this.setupRows();
            var compiled = _.template(OilTableTemplate, {rows: oilRows});
            this.$el.append(compiled);
            this.trigger('ready');
        },

        setupRows: function(){
            var totalCompiled = '';
            var oils = this.oilLib;
            if(this.filter){
                oils = oils.where(this.filter);
            }
            for (var i = 0; i < oils.length; i++){
                var compiled = _.template(OilRowTemplate, {data: this.oilLib.at(i)});
                totalCompiled += compiled;
            }
            return totalCompiled;
        }

    });
    return oilTableView;
});