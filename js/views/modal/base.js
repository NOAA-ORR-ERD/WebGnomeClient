define([
    'jquery',
    'underscore',
    'backbone',
    'lib/text!templates/modal/base.html',
    'lib/bootstrap.min'
], function($, _, Backbone, ModalTemplate){
    var baseModal = Backbone.View.extend({
        className: 'modal fade modal-' + this.name,

        initialize: function(){
            if($('.modal-' + this.name).length === 0){
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
            $('body').append(this.$el.html(compiled));
            this.$el.modal(this.options);
        }
    });

    return baseModal;
});