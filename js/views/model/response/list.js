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
            'click tbody tr': 'clickSystem'
        },

        initialize: function(options){
            this.weatherers = options.weatherers ? options.weatherers : '';
            this.process = options.process ? options.process : '';
            this.colors  = options.colors;
            this.render();
        },

        closeChild: function(){
            delete this.child;
            this.render();
            this.trigger('select');
        },

        clickSystem: function(e){
            this.trigger('select', this.$el);
            var id = $(e.currentTarget).data('weatherer');
            var weatherer = webgnome.model.get('weatherers').get(id);
            this.child = new SingleView({
                weatherer: weatherer,
                process: this.process,
                colors: this.colors
             });
            this.listenTo(this.child, 'close', this.closeChild);
            this.$el.html(this.child.$el);
            this.child.render();
        },

        render: function(){
            if(this.weatherers.length > 0){
                if(_.isUndefined(this.child)){
                    
                    this.$el.html(
                        _.template(this.template)({
                            weatherers: this.weatherers,
                            api: this.getAPI(), 
                            converter: new nucos.OilQuantityConverter(),
                            units: webgnome.model.get('spills').at(0).get('units'),
                            systems: webgnome.cache.inline[webgnome.cache.inline.length - 1].get('WeatheringOutput').nominal.systems
                        })
                    );
                } else {
                    this.child.render();
                }
            }
        },

        getAPI: function(){
            var api;
            if (!webgnome.model.getSubstance().get('is_weatherable')){
                api = 10;
            } else {
                api = webgnome.model.getSubstance().get('api');
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