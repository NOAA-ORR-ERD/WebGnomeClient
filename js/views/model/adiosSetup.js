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
            'click .icon': 'selectPrediction'
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

        selectPrediction: function(e){
            var target;
            this.$('.icon').removeClass('selected');
            if(this.$(e.target).hasClass('icon')){
                this.$(e.target).addClass('selected');
                target = this.$(e.target).attr('class').replace('icon', '').replace('selected', '').trim();
            } else {
                this.$(e.target).parent().addClass('selected');
                target = this.$(e.target).parent().attr('class').replace('icon', '').replace('selected', '').trim();
            }

            if (target == 'fate') {
                this.showFateObjects();
            } else {
                this.showFatePlusObjects();
            }
        },

        showFateObjects: function(){
            this.$('.wind').css('opacity', 1).css('visibility', 'visible');
            this.$('.water').css('opacity', 1).css('visibility', 'visible');
            this.$('.spill').css('opacity', 1).css('visibility', 'visible');
            this.$('.map').css('opacity', 0).css('visibility', 'hidden');
        },

        showFatePlusObjects: function(){
            this.$('.wind').css('opacity', 1).css('visibility', 'visible');
            this.$('.water').css('opacity', 1).css('visibility', 'visible');
            this.$('.spill').css('opacity', 1).css('visibility', 'visible');
            this.$('.map').css('opacity', 1).css('visibility', 'visible');
        },

        close: function(){
            Backbone.View.prototype.close.call(this);
        }
    });

    return adiosSetupView;
});