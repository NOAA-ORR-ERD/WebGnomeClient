define([
    'underscore',
    'jquery',
    'backbone',
    'nucos',
    'views/base',
    'views/model/response/single'
], function(_, $, Backbone, nucos, BaseView, SingleView){
    var listView = BaseView.extend({

        events: {
            'click tr': 'clickResponse'
        },

        initialize: function(options){
            this.dataset = options.dataset ? options.dataset : {};
            this.responses = options.responses ? options.responses : '';
            this.results = options.results ? options.results: '';
            this.render();
        },

        closeChild: function(){
            delete this.child;
            this.render();
        },

        clickResponse: function(e){
            var id = $(e.currentTarget).data('response');
            var name = webgnome.model.get('weatherers').get(id).get('name');
            this.child = new SingleView({dataset: this.dataset[id], response_name: name, process: this.process});
            this.listenTo(this.child, 'close', this.closeChild);
            this.$el.html(this.child.$el);
            this.child.render();
        },

        render: function(results, dataset){
            if(_.isUndefined(this.child)){
                
                this.$el.html(
                    _.template(this.template, {
                        responses: this.responses,
                        results: !_.isUndefined(results) ? results : this.results,
                        api: this.getAPI(), 
                        converter: new nucos.OilQuantityConverter(),
                        units: webgnome.model.get('spills').at(0).get('units')
                    })
                );
                this.results = !_.isUndefined(results) ? results : this.results;
            } else {
                this.child.render();
            }
        },

        getAPI: function(){
            if (_.isNull(webgnome.model.get('spills').at(0).get('element_type').get('substance'))){
                api = 10;
            } else {
                api = webgnome.model.get('spills').at(0).get('element_type').get('substance').get('api');
            }
            return api;
        },

        close: function(){
            if(this.child){
                this.child.close();
            }
            BaseView.prototype.close.call(this);
        },
    });

    return listView;
});