define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/faq.html',
    'text!templates/faq/specific.html',
    'text!templates/faq/default.html',
    'model/help/help'
], function($, _, Backbone, FAQTemplate, SpecificTemplate, DefaultTemplate, HelpModel){
	var faqView = Backbone.View.extend({
        className: 'page faq',

        events: {
            'click .resume': 'resume',
            'click .build': 'build',
            'click .load': 'load',
            'focus #helpquery': 'renderContent',
            'click .back': 'restoreDefault',
            'click h4': 'specificHelp'
        },

        initialize: function(){
            this.seed();
            this.on('ready', this.parseHelp);
            this.fetchQuestions();
        },

        render: function(){
            var subtemplate = _.template(DefaultTemplate, {topics: this.parsedData});
            var compiled = _.template(FAQTemplate, {content: subtemplate});
            $('.faqspace').append(this.$el.append(compiled));
        },

        seed: function(){
            $('body').append('<div class="faqspace"></div>');
        },

        parseHelp: function(){
            var body = this.body;
            this.parsedData = [];
            for (var i = 0; i < 5; i++){
                if (_.isObject(body.get(i))){
                    var helpTopicBody = $('<div>' + body.get(i).html + '</div>');
                    var helpTitle = helpTopicBody.find('h1:first').text();
                    helpTopicBody.find('h1:first').remove();
                    var helpContent = helpTopicBody.html();
                    this.parsedData.push({title: helpTitle, content: helpContent});
                }
            }
            window.parsedData = this.parsedData;
            this.render();
        },

        fetchQuestions: function(){
            var helpModel = new HelpModel();
            helpModel.fetch({
                success: _.bind(function(model){
                    this.body = model;
                    this.trigger('ready');
                }, this)
            });
        },

        specificHelp: function(e){
            var data = this.parsedData;
            for (var i in data){
                if (data[i].title === e.target.dataset.title){
                    var compiled = _.template(SpecificTemplate, {title: data[i].title, content: data[i].content });
                    this.$('#support').html('');
                    this.$('#support').append(compiled);
                    break;
                }
            }
        },

        renderContent: function(){
            var subtemplate = _.template(SpecificTemplate, {});
            this.$('.helpcontent').html('');
            this.$('.helpcontent').append(subtemplate);
        },

        restoreDefault: function(){
            var subtemplate = _.template(DefaultTemplate, { topics: this.parsedData });
            this.$('#support').html('');
            this.$('#support').append(subtemplate);
        }
    });

    return faqView;
});