define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/model/adiosSetup.html',
    'jqueryDatetimepicker'
], function($, _, Backbone, AdiosSetupTemplate){
    var adiosSetupView = Backbone.View.extend({
        className: 'page adios setup',

        events: {
            'click .icon': 'selectIcon'
        },

        initialize: function(){
            this.render();
        },

        render: function(){
            var compiled = _.template(AdiosSetupTemplate);

            $('body').append(this.$el.append(compiled));

            this.$('.icon').tooltip({placement: 'bottom'});

            this.$('.date').datetimepicker({
                format: 'Y/n/j G:i'
            });
        },

        selectIcon: function(e){
            this.$('.icon').removeClass('selected');
            if(this.$(e.target).hasClass('icon')){
                this.$(e.target).addClass('selected');
            } else {
                this.$(e.target).parent().addClass('selected');
            }
        },

        close: function(){
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});