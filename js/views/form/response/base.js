define([
	'jquery',
	'underscore',
	'backbone',
	'views/modal/form',
	'moment',
    'sweetalert',
	'jqueryDatetimepicker',
    'jqueryui/widgets/slider'
], function($, _, Backbone, FormModal, moment, swal){
    'use strict';
	var baseResponseForm = FormModal.extend({
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="delete">Delete</button><button type="button" class="save">Save</button>',
        events: function(){
            return _.defaults({
                'click .delete': 'deleteResponse'
            }, FormModal.prototype.events);
        },

        deleteResponse: function(){
            var id = this.model.get('id');
            swal.fire({
                title: 'Delete "' + this.model.get('name') + '"',
                text: 'Are you sure you want to delete this response?',
                icon: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(deleteResponse) {
                if (deleteResponse.isConfirmed) {
                    webgnome.model.get('weatherers').remove(id);
                    webgnome.model.save();
                    this.on('hidden', _.bind(function(){
                        this.trigger('wizardclose');
                    }, this));
                    this.hide();
                }
            }, this));
        }
    });

    return baseResponseForm;
});