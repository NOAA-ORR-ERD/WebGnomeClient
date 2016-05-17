define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/form'
], function($, _, Backbone, FormModal){
    var BaseResponseForm = FormModal.extend({
        events: function(){
            return _.defaults({
                'click .delete': 'deleteResponse'
            }, FormModal.prototype.events);
        },

        deleteResponse: function(){
            var id = this.model.get('id');
            swal({
                title: 'Delete "' + this.model.get('name') + '"',
                text: 'Are you sure you want to delete this response?',
                type: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(isConfirmed){
                if(isConfirmed){
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

    return BaseResponseForm;
});