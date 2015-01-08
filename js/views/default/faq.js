define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/faq.html',
    'text!templates/faq/specific.html',
    'text!templates/faq/default.html'
], function($, _, Backbone, FAQTemplate, SpecificTemplate, DefaultTemplate){
	var faqView = Backbone.View.extend({
        className: 'page faq',

        events: {
            'click .resume': 'resume',
            'click .build': 'build',
            'click .load': 'load',
            'focus #helpquery': 'renderContent'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var subtemplate = _.template(DefaultTemplate, {});
            var compiled = _.template(FAQTemplate, {content: subtemplate});
            $('body').append(this.$el.append(compiled));
        },

        renderContent: function(){
            var subtemplate = _.template(SpecificTemplate, {});
            this.$('.helpcontent').html('');
            this.$('.helpcontent').append(subtemplate);
        }
    });

    return faqView;
});