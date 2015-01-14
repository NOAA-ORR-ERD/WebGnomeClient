define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/help',
    'views/modal/help'
], function($, _, Backbone, HelpView, HelpModal) {
    var baseView = Backbone.View.extend({

        events: {
            'click .gnome-help': 'renderHelp'
        },

        initialize: function(){
            if (this.module) {
                this.help = new HelpView({path: this.module.id, context: 'view'});
            }
        },

        render: function(){
            if(this.help.ready){
                this.showHelp();
            } else {
                this.help.on('ready', this.showHelp, this);
            }
        },

        renderHelp: function(){
            var modal = new HelpModal({help: this.help});
            modal.render();
        },
        

    });

    return baseView;
});
