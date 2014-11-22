define([
    'jquery',
    'underscore',
    'backbone',
    'model/help/help',
    'model/help/feedback',
    'text!templates/default/help.html'
], function($, _, Backbone, HelpModel, FeedbackModel, HelpTemplate){
    var helpView = Backbone.View.extend({
        className: 'help-content alert alert-info alert-dismissable',
        ready: false,

        events: {
            'click .helpful a': 'logHelpful',
            'click .send': 'logHelp'
        },

        initialize: function(options){
            if (_.has(options, 'path')){
                this.help = new HelpModel({id: options.path});
                this.help.fetch({
                    success: _.bind(function(){
                        this.ready = true;
                        this.render();
                        this.trigger('ready');
                    }, this)
                });
            }
        },

        render: function(){
            var compiled = _.template(HelpTemplate, {
                html: this.help.get('html')
            });
            this.$el.html(compiled);
        },

        logHelpful: function(e){
            var target;
            if (e.target.nodeName === 'SPAN'){
               target = e.target.parentElement;
            } else {
                target = e.target;
            }

            var ishelpful = target.dataset.helpful;

            this.$('.helpful a').removeClass('selected');
            this.$(target).addClass('selected');

            this.help.set('helpful', ishelpful);
            this.help.save(null, {
                success: _.bind(function(){
                    if(this.help.get('helpful') === 'false'){
                        this.showResponse();
                    }
                }, this)
            });
        },

        showResponse: function(){
            this.$('.response').show();
        },

        logHelp: function(){
            this.help.set('response', this.$('textarea').val());
            this.help.save(null, {
                success: _.bind(function(){
                    this.$('.helpful, .response').hide();
                    this.$('.thankyou').fadeIn();
                })
            });
        }
    });

    return helpView;
});