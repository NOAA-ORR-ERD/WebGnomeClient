define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'text!templates/default/faq.html',
    'text!templates/faq/specific.html',
    'text!templates/faq/default.html',
    'model/help/help',
    'collection/help',
    'jqueryui/autocomplete'
], function($, _, Backbone, chosen, FAQTemplate, SpecificTemplate, DefaultTemplate, HelpModel, HelpCollection){
	var faqView = Backbone.View.extend({
        className: 'page faq',

        events: {
            'keyup input': 'update',
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

        update: function(){
            var term = this.$('.chosen-select').val();
            var topicArray = this.collection.search(term);
            var obj = this.getData(topicArray);
            var titles = [];

            for (var i in obj){
                titles.push(obj[i].title);
            }
            this.$('#helpquery').autocomplete({source: titles});
            if (this.exactMatch(term, titles)){
                this.specificHelp(null, term);
            } else {
                this.restoreDefault();
            }
        },

        exactMatch: function(term, titles){
            for (var i in titles){
                if (term === titles[i]){
                    return true;
                }
            }
            return false;
        },

        populateTopics: function(){
            //this.$('.chosen-select').append($('<option></option>').attr('value', 'none').text('none'));
            var data = this.parsedData;
            // for (var k in data){
            //     this.$('.chosen-select')
            //         .append($('<option></option>')
            //             .attr('value', data[k].title)
            //             .text(data[k].title));
            // }
        },

        seed: function(){
            $('.faqspace').remove();
            $('body').append('<div class="faqspace"></div>');
        },

        getData: function(models){
            var data = [];
            if (_.isUndefined(models)){
                models = this.body.models;
            }
            for (var i in models){
                if (_.isObject(models[i])){
                    var helpTopicBody = $('<div>' + models[i].get('html') + '</div>');
                    var helpTitle = helpTopicBody.find('h1:first').text();
                    helpTopicBody.find('h1:first').remove();
                    var helpContent = helpTopicBody.html();
                    var path = models[i].get('path');
                    if (helpTitle !== ''){
                        data.push({title: helpTitle, content: helpContent, path: path});
                    }
                }
            }
            return data;
        },

        parseHelp: function(){
            this.parsedData = this.getData();
            this.render();
        },

        fetchQuestions: function(){
            this.collection = new HelpCollection();
            this.collection.fetch({
                success: _.bind(function(model){
                    this.body = model;
                    this.trigger('ready');
                }, this)
            });
        },

        specificHelp: function(e, title){
            var data = this.parsedData;
            var target;
            var compiled;
            if (_.isNull(e)){
                target = null;
            } else {
                target = e.target.dataset.title;
            }
            for (var i in data){
                if (title === data[i].title || data[i].title === target){
                    compiled = _.template(SpecificTemplate, {title: data[i].title, content: data[i].content });
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