define([
    'jquery',
    'underscore',
    'module',
    'views/modal/form',
    'views/uploads/upload_folder',
    'model/movers/cats',
    'model/movers/grid_current',
    'model/movers/py_current',
    'views/form/mover/goods',
    'views/form/mover/upload',
    'text!templates/form/mover/type.html'
], function($, _, module, FormModal, UploadFolder,
            CatsMover, c_GridCurrentMover, PyCurrentMover,
            GoodsMoverForm, MoverUploadForm,
            CreateMoverTemplate) {
    var createMoverTypeForm = FormModal.extend({
        className: 'modal form-modal current-form',
        title: 'Create Current Mover',
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button>',

        events: function() {
            return _.defaults({
                'click .gridcurrent': 'gridcurrent',
                'click .cats': 'cats',
                'click .py_current': 'py_current',
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

        gridcurrent: function() {
            //Legacy c_GridCurrentMover
            this.nextStep(c_GridCurrentMover.prototype.defaults().obj_type);
        },

        cats: function() {
            this.nextStep(CatsMover.prototype.defaults().obj_type);
        },

        py_current: function() {
            this.nextStep(PyCurrentMover.prototype.defaults.obj_type);
        },
        
        customLocation: function(){
            var customForm = new GoodsMoverForm({size: 'xl'});
            customForm.render();
            this.hide();
        }
    });

    return createMoverTypeForm;
});
