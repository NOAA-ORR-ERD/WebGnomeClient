define([
    'jquery',
    'underscore',
    'backbone',
    'chosen',
    'text!templates/default/faq.html',
    'views/default/help',
    'views/faq/default',
    'views/faq/single',
    'model/help/help',
    'collection/help',
    'jqueryui/autocomplete'
], function($, _, Backbone, chosen, FAQTemplate, HelpView, DefaultView, SingleView, HelpModel, HelpCollection){
	var faqView = HelpView.extend({
        className: 'page faq',

        events: function(){
            return _.defaults({
                'keyup input': 'update',
                'click .back': 'back',
                'click .topic': 'specificHelp'
            }, HelpView.prototype.events);
        },

        initialize: function(options){
            this.seed();
            this.on('ready', this.parseHelp);
            this.fetchQuestions();
            if (!_.isUndefined(options.topic)){
                this.title = options.topic;
            }
        },

        render: function(){
            var compiled = _.template(FAQTemplate, {});
            $('.faqspace').append(this.$el.append(compiled));
            if (this.title){
                var title = this.title;
                this.specificHelp({}, title);
            } else {
                this.defaultView = new DefaultView({topics: this.parsedData});
            }
        },

        update: function(e, str){
            var term = this.$('.chosen-select').val();
            if (str){
                term = str;
            }
            this.topicArray = this.collection.search(term);
            var obj = this.getData(this.topicArray);
            var titles = [];
            for (var i in obj){
                titles.push(obj[i].title);
            }
            var autocompleteConfig = {
                                        source: function(req, res){
                                            res(titles);
                                        },
                                        select: _.bind(function(e, ui){
                                            if (!_.isUndefined(e)){
                                                this.update({which: 13}, e.toElement.innerHTML);
                                            }
                                            $('.chosen-select').autocomplete('close');
                                            $('.chosen-select').val(ui.item.value);
                                        }, this)
                                     };

            this.$('#helpquery').autocomplete(autocompleteConfig);

            if (this.exactMatch(term, titles) && e.which === 13){
                this.specificHelp(null, term);
                this.$('.chosen-select').autocomplete('close');
            }

            if (!_.isUndefined(e) && titles.length === 1 && e.which === 13){
                this.$('.chosen-select').val(titles[0]);
                this.specificHelp(null, titles[0]);
                this.$('.chosen-select').autocomplete('close');
            }
            this.trigger('updated');
        },

        exactMatch: function(term, titles){
            for (var i in titles){
                if (term === titles[i]){
                    return true;
                }
            }
            return false;
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
                    var excerpt = models[i].makeExcerpt();
                    var keywords = models[i].get('keywords');
                    if (helpTitle !== ''){
                        data.push({title: helpTitle, content: helpContent, path: path, keywords: keywords, excerpt: excerpt});
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
            var subtemplate;
            if (_.isNull(e) || _.isEmpty(e)){
                target = title;
            } else if (_.isUndefined(e.target.dataset.title)){
                target = this.$(e.target).siblings('h4')[0].dataset.title;
            } else {
                target = e.target.dataset.title;
            }
            for (var i in data){
                if (title === data[i].title || data[i].title === target){
                    this.singleHelp = new SingleView({topic: data[i]});
                    break;
                }
            }
            webgnome.router.navigate('faq/' + target);
        },

        renderContent: function(){
            var subtemplate = _.template(SpecificTemplate, {});
            this.$('.helpcontent').html('');
            this.$('.helpcontent').append(subtemplate);
        },

        back: function(){
            this.restoreDefault();
            this.$('.chosen-select').val('');
            //webgnome.router.navigate('faq', {trigger: true});
        },

        restoreDefault: function(clear){
            if (_.isUndefined(this.defaultView)){
                this.defaultView = new DefaultView({topics: this.parsedData});
            } else {
                this.defaultView.render();
            }
            webgnome.router.navigate('faq');
        }
    });

    return faqView;
});