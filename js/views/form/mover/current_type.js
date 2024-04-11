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
    'text!templates/form/mover/current_type.html'
], function($, _, module, FormModal, UploadFolder,
            CatsMover, c_GridCurrentMover, PyCurrentMover,
            GoodsMoverModal, MoverUploadModal,
            CreateMoverTemplate) {
    var createMoverTypeModal = FormModal.extend({
        className: 'modal Modal-modal current-Modal',
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
            var uploadModal = new MoverUploadModal({obj_type: obj_type});
            this.trigger('select', uploadModal);
            this.hide(function(){uploadModal.render();});
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
            var customModal = new GoodsMoverModal({size: 'xl', request_type: 'currents'});
            this.trigger('select', customModal);
            this.hide(function(){customModal.render();});
        }
    });

    return createMoverTypeModal;
});
