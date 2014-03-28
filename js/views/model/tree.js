define([
    'jquery',
    'underscore',
    'backbone',
    'jqueryui',
], function($, _, Backbone){
    var treeView = Backbone.View.extend({
        className: 'tree opened',
        open: true,
        width: '30%',

        initialize: function(){
            this.render();
        },

        render: function(){
            this.$el.html('<div class="resize"></div>');
        },

        toggle: function(){
            if(this.open){
                this.open = false;
                this.offset = this.$('.resize').innerWidth();
                this.$el.css({width: 0, paddingRight: this.offset}).removeClass('opened').addClass('closed');
                console.log(this.width);
            } else {
                this.open = true;
                this.$el.css({width: this.width, paddingRight: 0}).addClass('opened').removeClass('closed');
            }

            return this.offset;
        }
    });

    return treeView;
});