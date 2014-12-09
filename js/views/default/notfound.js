define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/notfound.html'
], function($, _, Backbone, NotFoundTemplate){
    var notFoundView = Backbone.View.extend({
        className: 'page notfound',

        initialize: function() {
            this.render();
        },

        render: function(){
            var compiled = _.template(NotFoundTemplate, {email: 'localhost@localhost.com'});
            $('body').append(this.$el.html(compiled));
        }
    });
    return notFoundView;
});