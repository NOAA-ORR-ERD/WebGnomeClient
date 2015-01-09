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
            this.render();
        },

        render: function(){
            var subtemplate = _.template(DefaultTemplate, {});
            var compiled = _.template(FAQTemplate, {content: subtemplate});
            $('body').append(this.$el.append(compiled));
            var helpModel = new HelpModel();
            helpModel.fetch({
                success: _.bind(function(model){
                    this.questions = model;
                    this.parseHelp(model);
                }, this)
            });
        },

        parseHelp: function(model){
            for (var i = 0; i < 20; i++){
                console.log(this.questions);
                if (_.isObject(model.attributes[i])){
                    var helpHTML = $('<div />').append(model.attributes[i].html);
                    var path = model.attributes[i].path;
                    var helpTitle = $($.parseHTML(helpHTML[0].innerHTML)).find('h1')[i].innerHTML;
                    this.$('.helpcontent').append('<div class="col-md-6"><h4 data-path="' + path + '">' + helpTitle + '</h4></div>');
                }
            }
        },

        specificHelp: function(e){
            console.log(e.target.dataset);
        },

        renderContent: function(){
            var subtemplate = _.template(SpecificTemplate, {});
            this.$('.helpcontent').html('');
            this.$('.helpcontent').append(subtemplate);
        },

        restoreDefault: function(){
            var subtemplate = _.template(DefaultTemplate, {});
            this.$('.helpcontent').html('');
            this.$('.helpcontent').append(subtemplate);
        }
    });

    return faqView;
});