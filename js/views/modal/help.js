define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/about.html'
], function($, _, Backbone, BaseModal, AboutTemplate){
    var helpModal = BaseModal.extend({
        name: 'gnome-help',
        size: 'md',
        title: 'Help',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Close</button>',

        initialize: function(options){
            if(_.has(options, 'view')){
                this.body = options.view.$el;
            } else {
                this.body = 'No help documentation found!';
            }
            this.render();
        }
    });

    return helpModal;
});