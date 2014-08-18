define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/oilTable.html'
], function($, _, Backbone, OilTableTemplate){
    var oilTableView = Backbone.View.extend({
        //className: 'oilTable',
        id: 'tableContainer',

        initialize: function() {
            var compiled = _.template(OilTableTemplate);
            this.$el.append(compiled);
        }
    });
    return oilTableView;
});