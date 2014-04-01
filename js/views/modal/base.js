define([
    'jquery',
    'underscore',
    'backbone',
    'lib/bootstrap.min',
    'lib/text!templates/modal/base.html'
], function($, _, Backbone, bs, ModalTemplate){
    var baseModal = Backbone.View.extend({
        className: 'modal fade',

        initialize: function(){
            if($('.modal').length === 0){
                this.render();
            }
        },
        name: 'default',
        title: 'Default Modal',
        body: '',
        size: 'reg',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Save</button>',
        options: {
            backdrop: true,
            keyboard: true,
            show: false,
            remote: false
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
            var compiled = _.template(ModalTemplate, {
                size: this.size,
                title: this.title,
                body: this.body(),
                buttons: this.buttons
            });
            $('body').append(this.$el.html(compiled));
            this.$el.modal(this.options);
        }
    });

    return baseModal;
});