define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/faq.html'
], function($, _, Backbone, FAQTemplate){
	var faqView = Backbone.View.extend({
        className: 'page faq',

        events: {
            'click .resume': 'resume',
            'click .build': 'build',
            'click .load': 'load',
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(FAQTemplate, {});
            $('body').append(this.$el.append(compiled));
        }
    });

    return faqView;
});