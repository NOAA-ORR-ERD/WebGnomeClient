define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'text!templates/modal/base.html',
    'mousetrap'
], function($, _, Backbone, bs, ModalTemplate, Mousetrap){
    var baseModal = Backbone.View.extend({
        className: 'modal fade',
        name: 'default',
        title: 'Default Modal',
        body: '',
        size: 'reg',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        options: {
            backdrop: 'static',
            keyboard: true,
            show: true,
            remote: false
        },

        initialize: function(options){

            // Bound enter event to submit the form modal in the same way as if a user clicked the save button

            Mousetrap.bind('enter', _.bind(this.submitByEnter, this));

            Mousetrap.bind('esc', _.bind(this.cancelByEsc, this));

            if(options){
                if(options.body) {
                    this.body = options.body;
                }

                if(options.name) {
                    this.name = options.name;
                }

                if(options.title) {
                    this.title = options.title;
                }

                if(options.buttons) {
                    this.buttons = options.buttons;
                }
            }
        },

        events: {
            'hidden.bs.modal': 'close'
        },

        show: function(){
            this.$el.modal('show');
        },

        hide: function(){
            this.$el.modal('hide');
        },

        toggle: function(){
            this.$el.modal('toggle');
        },

        render: function(){
            if (!_.isString(this.body)){
                this.body = this.body();
            }
            
            var compiled = _.template(ModalTemplate, {
                size: this.size,
                title: this.title,
                body: this.body,
                buttons: this.buttons
            });
            $('body').append(this.$el.html(compiled));
            this.$el.modal(this.options);

            // Added mousetrap class to all of the input elements so that enter will still fire even if an input
            // field is focused at the time. Link to docs here: http://craig.is/killing/mice#api.bind.text-fields

            this.$('input').addClass('mousetrap');
            this.$('select').addClass('mousetrap');
        },

        submitByEnter: function(e){
            e.preventDefault();
        
            // Method below fires a click event on the save button of the form
        
            this.$('.save').click();
        },

        cancelByEsc: function(e){
            e.preventDefault();
            this.$('.cancel').click();
        }
    });

    return baseModal;
});