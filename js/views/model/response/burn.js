define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'text!templates/model/response/burn.html'
], function($, _, Backbone, BaseView, BurnListTemplate){
    var burnResponseListView = BaseView.extend({
        initialize: function(options){
            this.responses = options.responses;
            this.results = options.results;
            this.render();
        },

        render: function(){
            this.$el.html(
                _.template(BurnListTemplate, {
                    burn: this.responses,
                    results: this.results
                })
            );
        }
    });

    return burnResponseListView;

});
