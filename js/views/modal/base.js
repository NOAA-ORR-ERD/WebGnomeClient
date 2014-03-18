define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/modal/base.html',
    'lib/bootstrap.min'
], function($, _, Backbone, ModalTemplate){
    var baseModal = Backbone.View.extend({
        initialize: function(){
            if($('.modal-' + this.name).length === 0){
                $('body').append('<div class="modal fade modal-' + this.name + '" role="dialog"></div>');
                this.$el = $('.modal-' + this.name);
                this.render();
            }
        },
        name: 'default',
        title: 'Default Modal',
        body: '',
        options: {
            backdrop: true,
            keyboard: true,
            show: false,
            remote: false
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
                title: this.title,
                body: this.body
            });
            this.$el.html(compiled);
            this.$el.modal(this.options);
        }
    });

    return baseModal;
});