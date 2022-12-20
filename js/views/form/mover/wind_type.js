define([
    'jquery',
    'underscore',
    'module',
    'views/modal/form',
    'model/movers/wind',
    'model/movers/py_wind',
    'views/form/mover/goods',
    'views/form/mover/wind',
    'views/form/mover/upload',
    'text!templates/form/mover/wind_type.html'
], function($, _, module, FormModal,
            PointWindMover, PyWindMover,
            GoodsMoverForm, WindMoverForm, MoverUploadForm,
            CreateMoverTemplate) {
    var createMoverTypeForm = FormModal.extend({
        className: 'modal form-modal current-form',
        title: 'Create Wind Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function() {
            return _.defaults({
                'click .point_wind': 'pointWind',
                'click .py_wind': 'pyWind',
                'click .customLocation': 'customLocation',
                'click .cancel': 'close',
            }, FormModal.prototype.events);
        },

        initialize: function(options) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);

            this.listenTo(this, 'hide', this.close);
            this.body = _.template(CreateMoverTemplate)();
        },

        nextStep: function(obj_type) {
            var uploadForm = new MoverUploadForm({obj_type: obj_type});
            uploadForm.render();
            this.hide();
        },       

        pointWind: function() {
            var windForm = new WindMoverForm();
            this.trigger('select', windForm);
            windForm.on('save', _.bind(function(windMover){
                webgnome.model.get('movers').add(windMover);
                webgnome.model.get('environment').add(windMover.get('wind'));
                webgnome.model.save(null, {validate: false});
            }, this));
            windForm.render();
            windForm.on('hidden', windForm.close);
            this.listenToOnce(windForm, 'save', _.bind(this.trigger, this, 'save'));
            this.listenToOnce(windForm, 'cancel', _.bind(this.show, this));
            this.hide();
        },

        pyWind: function() {
            var form = new MoverUploadForm({
                obj_type: PyWindMover.prototype.defaults.obj_type,
                title: 'Upload Gridded Wind File'
            });
            this.trigger('select', form);
            form.on('hidden', form.close);
            form.render();
            this.hide();
        },
        
        customLocation: function(){
            var customForm = new GoodsMoverForm({size: 'xl', request_type:'winds'});
            this.trigger('select', customForm);
            customForm.render();
            this.hide();
        }
    });

    return createMoverTypeForm;
});
