define([
    'jquery',
    'underscore',
    'backbone',
    'model/cache',
    'views/model/trajectory',
    'views/model/fate',
    'sweetalert'
], function($, _, Backbone, Cache, TrajectoryView, FateView, swal){
    'use strict';
    var modelView = Backbone.View.extend({
        className: 'page model',
        switch: true,

        initialize: function(){
            this.contextualize();
            this.render();
            $(window).on('resize', _.bind(function(){
                this.updateHeight();
            }, this));
        },

        events: {
            'click .view-toggle .toggle': 'switchView',
            'click .view-toggle label': 'switchView'
        },

        contextualize: function(){
            // fate view should only be selected/active if there's
            // a weatherable substance and water added to the model
            var spillLength = webgnome.model.get('spills').length;
            var water = webgnome.model.get('environment').findWhere({obj_type: 'gnome.environment.environment.Water'});
            var sub = spillLength > 0 ? webgnome.model.get('spills').at(0).get('element_type').get('substance') : null;

            if(!water || !sub){
                localStorage.setItem('view', 'trajectory');
                this.switch = false;
            }
        },

        render: function(){
            // this.$el.append(IndexTemplate);
            $('body').append(this.$el);
            var view = localStorage.getItem('view');

            if(_.isNull(view)){
                view = 'fate';
            }
            
            if(!this.switch){
                this.$('.view-toggle').css('visibility', 'hidden');
            }
            this.$('.switch').addClass(view);
            localStorage.setItem('view', view);

            if (view === 'fate') {
                this.renderFate();
            } else {
                this.renderTrajectory();
                this.updateHeight();
            }
        },

        renderTrajectory: function(){
            // this.TreeView = new TreeView();
            this.TrajectoryView = new TrajectoryView();
            // this.TreeView.on('toggle', this.TrajectoryView.toggle, this.TrajectoryView);
            this.$el.append(this.TrajectoryView.$el);
        },

        renderFate: function(){
            this.FateView = new FateView();
            this.$el.append(this.FateView.$el);
        },

        switchView: function(){
            var view = localStorage.getItem('view');
            if(view === 'fate') {
                this.$('.switch').removeClass('fate').addClass('trajectory');
                localStorage.setItem('view', 'trajectory');
                view = 'trajectory';
            } else {
                this.$('.switch').removeClass('trajectory').addClass('fate');
                localStorage.setItem('view', 'fate');
                view = 'fate';
            }

            this.reset();

            if(view === 'fate'){
                this.renderFate();
                this.$el.css('height', 'auto');
            } else {
                this.renderTrajectory();
                this.updateHeight();
            }
        },

        reset: function(){
            // if(this.TreeView){
            //     this.TreeView.close();
            // }
            if(this.TrajectoryView){
                this.TrajectoryView.close();
            }
            if(this.FateView){
                this.FateView.close();
            }
        },

        updateHeight: function(){
            var view = localStorage.getItem('view');
            if(view === 'trajectory'){
                var win = $(window).height();
                var height = win - 94 - 52;
                this.$el.css('height', height + 'px');
            }
        },

        close: function(){
            if(this.TreeView){
                this.TreeView.close();
            }

            if(this.TrajectoryView){
                this.TrajectoryView.close();
            }
            
            if(this.FateView){
                this.FateView.close();
            }

            $(window).off('resize', _.bind(function(){
                this.updateHeight();
            }, this));

            $('.sweet-overlay').remove();
            $('.sweet-alert').remove();

            this.remove();
            if (this.onClose){
                this.onClose();
            }
        }
    });

    return modelView;
});