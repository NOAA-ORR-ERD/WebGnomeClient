define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'text!templates/default/faq.html',
    'text!templates/faq/specific.html',
    'text!templates/faq/default.html',
    'model/help/help',
    'collection/help'
], function($, _, Backbone, chosen, FAQTemplate, SpecificTemplate, DefaultTemplate, HelpModel, HelpCollection){
	var faqView = Backbone.View.extend({
        className: 'page faq',

        events: {
            'click .resume': 'resume',
            'click .build': 'build',
            'click .load': 'load',
            'focus #helpquery': 'renderContent',
            'click .back': 'restoreDefault',
            'click .topic': 'specificHelp'
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
            this.populateTopics();
        },

        populateTopics: function(){
            this.$('.chosen-select').chosen({width: '200px', no_results_text: 'No results match!'});
            //this.$('.chosen-select').append($('<option></option>').attr('value', 'none').text('none'));
            var data = this.parsedData;
            for (var k in data){
                this.$('.chosen-select')
                    .append($('<option></option>')
                        .attr('value', data[k].title)
                        .text(data[k].title));
            }
            this.$('.chosen-select').trigger('chosen:updated');
        },

        seed: function(){
            $('.faqspace').remove();
            $('body').append('<div class="faqspace"></div>');
        },

        parseHelp: function(){
            var body = this.body.models;
            this.parsedData = [];
            for (var i in body){
                if (_.isObject(body[i])){
                    var helpTopicBody = $('<div>' + body[i].get('html') + '</div>');
                    var helpTitle = helpTopicBody.find('h1:first').text();
                    helpTopicBody.find('h1:first').remove();
                    var helpContent = helpTopicBody.html();
                    var path = body[i].get('path');
                    if (helpTitle !== ''){
                        this.parsedData.push({title: helpTitle, content: helpContent, path: path});
                    }
                }
            }
            this.render();
        },

        fetchQuestions: function(){
            var helpCollection = new HelpCollection();
            helpCollection.fetch({
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