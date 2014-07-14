define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'text!templates/modal/base.html'
], function($, _, Backbone, bs, ModalTemplate){
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
        },

        events: {
            'hidden.bs.modal': 'close',
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
        }
    });

    return baseModal;
});