define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/default/footer/footer.html',
    'views/modal/base',
    'text!templates/default/footer/disclaimer.html',
    'text!templates/default/footer/privacy.html'
], function($, _, Backbone, FooterTemplate, BaseModal, DisclaimerTemplate, PrivacyTemplate){
    var footerView = Backbone.View.extend({
        className: 'footer',
        rendered: false,

        events: {
            'click .disclaimer': 'disclaimer',
            'click .privacy': 'privacy'
        },

        initialize: function(){
            if($('body > .footer').length < 1){
                this.render();
            }
        },

        render: function(){
            this.rendered = true;
            var compiled = _.template(FooterTemplate);
            this.$el.append(compiled);
            $('body').append(this.$el);
        },

        disclaimer: function(e){
            e.preventDefault();
            var modal = new BaseModal({
                title: 'Disclaimer',
                body: DisclaimerTemplate,
                buttons: '<a href="" class="btn btn-primary" data-dismiss="modal">Ok</a>'
            });
            modal.render();
        }, 

        privacy: function(e){
            e.preventDefault();
            var modal = new BaseModal({
                title: 'Privacy Policy',
                body: PrivacyTemplate,
                buttons: '<a href="" class="btn btn-primary" data-dismiss="modal">Ok</a>'
            });
            modal.render(); 
        }
    });

    return footerView;
});