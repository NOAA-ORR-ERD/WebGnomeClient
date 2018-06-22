define([
    'jquery',
    'underscore',
    'module',
    'text!templates/form/griddedwind_edit.html',
    'model/movers/py_wind',
    'views/modal/form',
    'views/uploads/upload_folder'
], function($, _, module,
            GriddedWindEditTemplate,
            PyWindMover, FormModal, UploadFolder) {
    var griddedWindEditForm = FormModal.extend({
        className: 'modal form-modal griddedwind-form',
        title: 'Create Wind (Mover Only)',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>' +
                 '<button type="button" class="save" data-dismiss="modal">Save</button>',

        events: function() {
            return _.defaults({
                'click div :checkbox': 'setExtrapolation',
            }, FormModal.prototype.events);
        },

        initialize: function(options) {
            this.module = module;

            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options) {
            this.body = _.template(GriddedWindEditTemplate, {
                gridded_wind_mover: this.model
            });

            FormModal.prototype.render.call(this);
        },

        setExtrapolation: function(e) {
            var selected = $(e.target).is(':checked');
            this.model.get('wind').set('extrapolation_is_allowed', selected);
        },
    });

    return griddedWindEditForm;
});
