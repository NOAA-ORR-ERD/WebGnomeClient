define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/default/notfound.html'
], function($, _, Backbone, NotFoundTemplate){
    var notFoundView = Backbone.View.extend({
        initialize: function() {
            $('body').append('<div class="container page"></div>');
            this.el = $('.page');
            this.$el = $('.page');
            this.render();
        },

        render: function(){
            var compiled = _.template(NotFoundTemplate, {email: 'localhost@localhost.com'});
            this.$el.html(compiled);
        }
    });
    return notFoundView;
});