define([
    'jquery',
    'underscore',
    'module',
    'text!templates/form/mover/edit.html',
    'model/movers/py_wind',
    'views/modal/form',
    'views/uploads/upload_folder'
], function($, _, module,
            GriddedWindEditTemplate,
            PyWindMover, FormModal, UploadFolder) {
    var griddedWindEditForm = FormModal.extend({
        className: 'modal form-modal griddedwind-form',
        title: 'Gridded Wind',
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
            var extrapolation_allowed = false;
            var start_time;
            var end_time;
            //var active_range;
            extrapolation_allowed = this.model.get('wind').get('extrapolation_is_allowed');
            start_time = this.model.get('wind').get('data_start');
            end_time = this.model.get('wind').get('data_stop');
            //active_range = this.model.get('wind').get('active_range');
                
            this.body = _.template(GriddedWindEditTemplate, {
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('wind_scale'),
                extrapolation_is_allowed: extrapolation_allowed,
                start_time: start_time,
                end_time: end_time                
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
