define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/footer.html'
], function($, _, Backbone, FooterTemplate){
    var footerView = Backbone.View.extend({
        className: 'footer',
        rendered: false,

        initialize: function(){
            this.render();
        },

        render: function(){
            this.rendered = true;
            var compiled = _.template(FooterTemplate);
            this.$el.append(compiled);
            $('body').append(this.$el);
        }
    });

    return footerView;
});