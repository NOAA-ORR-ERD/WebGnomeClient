define([
    'jquery',
    'underscore',
    'backbone',
    'model/resources/oilLib',
    'text!templates/default/oilTable.html',
    'text!templates/default/oilRow.html',
    'datatables'
], function($, _, Backbone, OilLib, OilTableTemplate, OilRowTemplate, datatables){
    var oilTableView = Backbone.View.extend({
        //className: 'oilTable',
        id: 'tableContainer',
        ready: false,
        el: 'table',
        className: 'table',

        initialize: function(obj) {
            this.oilLib = new OilLib(_.bind(this.setReady,this));
            this.filter = obj;
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
                console.log(oils);
                oils = oils.where(this.filter);
                for (var i = 0; i < oils.length; i++){
                    var compiled = _.template(OilRowTemplate, {data: oils[i]});
                    totalCompiled += compiled;
                }
            } else {
                for (var i = 0; i < oils.length; i++){
                    var compiled = _.template(OilRowTemplate, {data: oils.at(i)});
                    totalCompiled += compiled;
                }
            }
            return totalCompiled;
        }

    });
    return oilTableView;
});