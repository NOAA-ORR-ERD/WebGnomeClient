define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'text!templates/modal/hotkeys.html'
], function($, _, Backbone, BaseModal, HotkeysTemplate){
    var hotkeysModal = BaseModal.extend({
        name: 'hotkeys',
        size: 'sm',
        title: 'Trajectory Hotkeys',
        body: _.template(HotkeysTemplate),
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Ok</button>'

        // events: {
        //     'shown.bs.modal': 'postRender'
        // },

        // postRender: function(){
        //     this.$('.modal-body').css('height', '175px');
        // }
    });

    return hotkeysModal;
});