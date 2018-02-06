define([
    'backbone',
    'jquery',
    'underscore',
    'views/form/mover/base',
    'text!templates/form/mover/component.html',
    'views/modal/form'
], function(Backbone, $, _, BaseMoverForm, FormTemplate, FormModal){
    var componentForm = BaseMoverForm.extend({
        title: 'Edit Component Mover',
        render: function(options){
            this.body = _.template(FormTemplate, {
                model: this.model.toJSON(),
                winds: this.getWinds()
            });

            FormModal.prototype.render.call(this, options);
        },

        update: function(options){
            FormModal.prototype.update.call(this, options);
            this.model.set('wind', webgnome.model.get('environment').get(this.model.get('wind')));
        },

        getWinds: function(){
            var env = webgnome.model.get('environment');
            return _.flatten(
                env.where({'obj_type': 'gnome.environment.wind.Wind'}),
                env.where({'obj_type': 'gnome.environment.environment_objects.GridWind'})
            );
        }
    });

    return componentForm;
});