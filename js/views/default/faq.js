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
            this.on('ready', this.parseHelp);
            this.fetchQuestions();
        },

        render: function(){
            var subtemplate = _.template(DefaultTemplate, {topics: this.parsedData});
            var compiled = _.template(FAQTemplate, {content: subtemplate});
            $('body').append(this.$el.append(compiled));
        },

        parseHelp: function(){
            var model = this.questions;
            this.parsedData = [];
            for (var i = 0; i < 5; i++){
                if (_.isObject(model.attributes[i])){
                    var helpHTML = $('<div />').append(model.attributes[i].html);
                    var path = model.attributes[i].path;
                    var helpTitle = $($.parseHTML(helpHTML[0].innerHTML)).find('h1')[i].innerHTML;
                    var helpContent = $($.parseHTML(helpHTML[0].innerHTML)).find('p')[i].innerHTML;
                    this.parsedData.push({title: helpTitle, content: helpContent});
                }
            }
            this.render();
        },

        fetchQuestions: function(){
            var helpModel = new HelpModel();
            helpModel.fetch({
                success: _.bind(function(model){
                    this.questions = model;
                    this.trigger('ready');
                }, this)
            });
        },

        specificHelp: function(e){
            var models = this.questions.attributes;
            for (var i in models){
                if (models[i].path === e.target.dataset.path){
                    var compiled = _.template(SpecificTemplate, {title: 'moo', content: models[i].html});
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