define([
    'jquery',
    'underscore',
    'backbone',
    'views/model/gnomeTree',
    'views/model/gnomeMap'
], function($, _, Backbone, TreeView, MapView){
    var gnomeModelView = Backbone.View.extend({
        className: 'page model',

        initialize: function(){
            this.TreeView = new TreeView();
            this.MapView = new MapView();

            this.render();
        },

        events: {
            'click .resize': 'toggle',
        },

        toggle: function(){
            var offset = this.TreeView.toggle();
            this.MapView.toggle(offset);
        },

        render: function(){
            this.$el.append(this.TreeView.$el).append(this.MapView.$el);
            $('body').append(this.$el);
        },

        close: function(){
            this.TreeView.close();
            this.MapView.close();

            this.remove();
            if (this.onClose){
                this.onClose();
            }
        }
    });

    return gnomeModelView;
});