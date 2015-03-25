define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'text!templates/faq/default.html'
], function($, _, Backbone, chosen, DefaultTemplate){
	var faqDefaultView = Backbone.View.extend({
		className: 'helpcontent',

		events: function(){
			return _.defaults({

			});
		},

		initialize: function(options){
			this.topics = options.topics;
			this.render();
		},

		render: function(){
			var compiled = _.template(DefaultTemplate, {topics: this.topics});
			this.$el.append(compiled);
		}

	});

	return faqDefaultView;
});