define([
    'underscore',
    'jquery',
    'backbone',
    'sweetalert',
    'views/panel/base',
    'views/form/diffusion',
    'text!templates/panel/diffusion.html',
], function(_, $, Backbone, swal, BasePanel, DiffusionFormView, DiffusionPanelTemplate){
    var diffusionPanel = BasePanel.extend({
        className: 'col-md-3 diffusion object panel-view',

        models: [
            'gnome.movers.random_movers.RandomMover'
        ],

        initialize: function(options){
            BasePanel.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model.get('movers'), 'change add remove', this.rerender);
        },

        new: function(e) {
            var form = new DiffusionFormView();

            form.on('wizardclose', _.bind(this.render, this));
            form.on('save', _.bind(function(){
                webgnome.model.get('movers').add(form.model, {merge: true});
                webgnome.model.save(null, {validate: false});
                form.on('hidden', form.close);
            }, this));
            form.on('wizardclose', form.close);

            form.render();
        },

        edit: function(e) {
            e.stopPropagation();
            var id = this.getID(e);

            var diffusion = webgnome.model.get('movers').get(id);
            var form = new DiffusionFormView(null, diffusion);

            form.on('save', function(){
                form.on('hidden', form.close);
            });
            form.on('wizardclose', form.close);

            form.render();
        },

        render: function() {
            var diffusion = webgnome.model.get('movers').filter(function(model){
                return model.get('obj_type') === 'gnome.movers.random_movers.RandomMover';
            });

            var compiled = _.template(DiffusionPanelTemplate)({
                diffusion: diffusion
            });
            this.$el.html(compiled);

            if (diffusion.length > 0) {
                this.$('.diffusion .panel').addClass('complete');
                this.$el.removeClass('col-md-3').addClass('col-md-6');
                this.$('.panel-body').show();
            } else {
                this.$el.removeClass('col-md-6').addClass('col-md-3');
                this.$('.panel-body').hide();
            }
            BasePanel.prototype.render.call(this);
        },

        delete: function(e) {
            e.stopPropagation();
            var id = this.getID(e);
            var diffusion = webgnome.model.get('movers').get(id);

            swal.fire({
                title: 'Delete "' + diffusion.get('name') + '"',
                text: 'Are you sure you want to delete this diffusion?',
                icon: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(deleteDiffusion) {
                if (deleteDiffusion.isConfirmed) {
                    webgnome.model.get('movers').remove(id);
                    webgnome.model.save(null, {
                        validate: false
                    });
                }
            }, this));
        },

    });

    return diffusionPanel;
});