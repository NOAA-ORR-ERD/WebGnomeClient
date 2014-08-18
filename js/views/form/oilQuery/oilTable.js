define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/oilTable.html'
], function($, _, Backbone, OilTableTemplate){
    var oilTableView = Backbone.View.extend({
        className: 'oilTable',

        initialize: function() {

        },

        render: function(){
            var compiled = _.template(OilTableTemplate);
            //this.$('#tableContainer').append(this.$el.html(compiled));
            return compiled;
        }
    });
    return oilTableView;
});