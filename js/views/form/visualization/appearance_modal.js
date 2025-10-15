define([
    'jquery',
    'underscore',
    'module',
    'views/modal/form',
    'views/form/visualization/spill_appearance'
], function($, _, module, FormModal, SpillAppearanceForm){
    'use strict';
    var appearanceModal = FormModal.extend({
        /*
        Modal for inspecting objects in the trajectory view layers menu. Presents metadata about the object and configuration for its Appearance
        */
        className: 'modal form-modal appearance-form',
        title: 'Appearance Properties',
        buttons: //'<button type="button" class="cancel" data-dismiss="modal">Cancel</button>' +
                 '<button type="button" class="back">Reset to Default</button>'+
                 '<button type="button" class="save">Save</button>',
        
        events: function() {
            return _.defaults({
                
            }, FormModal.prototype.events);
        },
        
        initialize: function(options){
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.options = options;
            if (options.spill) {
                this.appearanceForm = SpillAppearanceForm;
                this.model = options.spill.get('_appearance');
                this.sm = options.spill;
            } else {
                console.error('invalid option provided');
            }
            this.title = 'Change Map Appearance: ' + this.sm.get('name');
        },

        render: function(options) {
            var html = $('<form></form>',{ 'class': 'form-horizontal', 'role': 'form'});
            this.form = new this.appearanceForm(options, this.sm);
            html.append(this.form.$el);
            this.body = html;

            FormModal.prototype.render.call(this, options);
        },

        update: function(e) {
            //this trigger is to let the layers panel know that it needs to re-render!
            //webgnome.model.get('_appearance').trigger('change', this.layer.model);
            this.trigger('rerender');
        },

        back: function() {
            //Resets all appearances to the default for the object.
            var id = this.model.get('id');
            this.model.set(this.model.defaults());
            this.model.set('id', id);
            this.model.trigger('resetToDefault');
            if (this.model.get('obj_type').includes('spill')) {
                this.model.setupVis();
            }
            this.model.save();
            this.$el.html('');
            this.render();
        },

        
    });

    return appearanceModal;
});
