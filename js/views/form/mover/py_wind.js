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
                'change select': function(e) {
                    this.showActiveRange(e);
                },
                'click div :checkbox': 'setExtrapolation',
            }, FormModal.prototype.events);
        },

        initialize: function(options) {
            this.module = module;

            FormModal.prototype.initialize.call(this, options);
        },

        render: function(options) {
            
            var extrapolation_allowed = this.model.get('wind').get('extrapolation_is_allowed');
            var start_time = this.model.get('wind').get('data_start');
            var end_time = this.model.get('wind').get('data_stop');
            var active_range = this.model.get('active_range');


                
            this.body = _.template(GriddedWindEditTemplate)({
                name: this.model.get('name'),
                active: this.model.get('on'),
                scale_value: this.model.get('scale_value'),
                extrapolation_is_allowed: extrapolation_allowed,
                start_time: start_time,
                end_time: end_time,
                active_start: active_range[0],
                active_stop: active_range[1],                
            });

            FormModal.prototype.render.call(this);
            
            if (JSON.stringify(active_range) === JSON.stringify(["-inf","inf"])) {
                this.$('#set_active_range').val("infinite");              
            } else {
                this.$('#set_active_range').val("data_range");
                this.$(".active_range").removeClass("hide");
            }
        },
        
        update: function() {
            
            var name = this.$('#mover_name').val();
            this.model.set('name', name);
            
            var active_start = this.$('#active_start').val();
            var active_stop = this.$('#active_stop').val();   
            
            // if (active_start != '-inf') {
                // active_start = moment(active_start, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            // }
            // if (active_stop != 'inf') {
                // active_stop = moment(active_stop, webgnome.config.date_format.moment).format('YYYY-MM-DDTHH:mm:ss');
            // }
            
            this.model.set('active_range', [active_start, active_stop]);
            
            var scale_value = this.$('#scale_value').val();
            this.model.set('scale_value', scale_value);
            
        },

        setExtrapolation: function(e) {
            var selected = $(e.target).is(':checked');
            this.model.get('wind').set('extrapolation_is_allowed', selected);
        },
        
        showActiveRange: function(e) {
            
            var value = e.currentTarget.value;
            
            if (value === 'data_range') {
                this.$(e.currentTarget).parent().siblings('.hide').removeClass('hide');
                this.model.set('active_range',[this.model.get('data_start'),this.model.get('data_stop')]);
            } else {
                this.$(e.currentTarget).parent().siblings('.active_range').addClass('hide');
                this.model.set('active_range',["-inf","inf"]);
            }
            
            this.$('#active_start').val(this.model.get('active_range')[0]);
            this.$('#active_stop').val(this.model.get('active_range')[1]);
        },
    });

    return griddedWindEditForm;
});