define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
], function($, _, Backbone, BaseModal){
    var helpModal = BaseModal.extend({
        name: 'gnome-help',
        size: 'md',
        title: 'Help',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Close</button>',

        initialize: function(options){
            if(_.has(options, 'help')){
                options.help.delegateEvents();
                this.body = options.help.$el;
                this.title = this.body.find('h1:first').text() + ' help';
            } else {
                this.body = 'No help documentation found!';
            }
        },
    });

    return helpModal;
});