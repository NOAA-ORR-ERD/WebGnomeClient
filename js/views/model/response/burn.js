define([
    'jquery',
    'underscore',
    'backbone',
    'nucos',
    'views/base',
    'text!templates/model/response/burn.html',
    'views/model/response/single'
], function($, _, Backbone, nucos, BaseView, BurnListTemplate, SingleView){
    var burnResponseListView = BaseView.extend({

        events: {
            'click tr': 'clickResponse'
        },

        initialize: function(options){
            this.dataset = options.dataset ? options.dataset : {};
            this.responses = options.responses ? options.responses : '';
            this.results = options.results ? options.results: '';
            this.render();
        },

        clickResponse: function(e){
            var id = $(e.currentTarget).data('response');
            var name = webgnome.model.get('weatherers').get(id).get('name');
            this.child = new SingleView({dataset: this.dataset[id], response_name: name, process: 'Burned'});
            this.listenTo(this.child, 'close', this.closeChild);
            this.$el.html(this.child.$el);
            this.child.render();
        },

        closeChild: function(){
            delete this.child;
            this.render();
        },

        render: function(results, dataset){
            if(_.isUndefined(this.child)){
                if (_.isNull(webgnome.model.get('spills').at(0).get('element_type').get('substance'))){
                    api = 10;
                } else {
                    api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
                }
                var converter = new nucos.OilQuantityConverter();
                var units = webgnome.model.get('spills').at(0).get('units');

                this.$el.html(
                    _.template(BurnListTemplate, {
                        burn: this.responses,
                        results: !_.isUndefined(results) ? results : this.results,
                        api: api, 
                        converter: converter,
                        units: units
                    })
                );
                this.results = !_.isUndefined(results) ? results : this.results;
            } else {
                this.child.render();
            }
        },

        close: function(){
            if(this.child){
                this.child.close();
            }
            BaseView.prototype.close.call(this);
        },
    });

    return burnResponseListView;
});
