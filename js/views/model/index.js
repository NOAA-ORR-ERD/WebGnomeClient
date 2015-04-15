define([
    'jquery',
    'underscore',
    'backbone',
    'model/cache',
    'views/model/tree',
    'views/model/trajectory',
    'views/model/fate',
    'text!templates/model/index.html',
    'sweetalert'
], function($, _, Backbone, Cache, TreeView, TrajectoryView, FateView, IndexTemplate, swal){
    var modelView = Backbone.View.extend({
        className: 'page model',

        initialize: function(){
            this.render();
            $(window).on('resize', _.bind(function(){
                this.updateHeight();
            }, this));
        },

        events: {
            'click .view-toggle .toggle': 'switchView',
            'click .view-toggle label': 'switchView'
        },

        render: function(){
            this.$el.append(IndexTemplate);
            $('body').append(this.$el);
            var view = localStorage.getItem('view');
            var prediction = localStorage.getItem('prediction');

            if(_.isNull(view)){
                // if the view is undefined, set it to requested prediction
                if(prediction === 'both'){
                    view = 'trajectory';
                } else {
                    view = prediction;
                }
            } else {
                // the view is defined make sure it's a viewable view based on the requested prediction
                // ex. if the view is fate but pred is traj don't render the fate view.
                if(prediction != 'both'){
                    view = prediction;
                }
            }
            
            this.$('.switch').addClass(view);
            localStorage.setItem('view', view);

            if (view == 'fate') {
                this.renderFate();
            } else {
                this.renderTrajectory();
                this.updateHeight();
            }
        },

        renderTrajectory: function(){
            this.TreeView = new TreeView();
            this.TrajectoryView = new TrajectoryView();
            this.TreeView.on('toggle', this.TrajectoryView.toggle, this.TrajectoryView);
            this.$el.append(this.TreeView.$el).append(this.TrajectoryView.$el);
        },

        renderFate: function(){
            this.FateView = new FateView();
            this.$el.append(this.FateView.$el);
        },

        switchView: function(){
            var view = localStorage.getItem('view');
            if(view == 'fate') {
                this.$('.switch').removeClass('fate').addClass('trajectory');
                localStorage.setItem('view', 'trajectory');
                view = 'trajectory';
            } else {
                this.$('.switch').removeClass('trajectory').addClass('fate');
                localStorage.setItem('view', 'fate');
                view = 'fate';
            }

            this.reset();

            if(view === 'trajectory' && localStorage.getItem('prediction') === 'fate'){
                swal({
                    title: 'Unable to run trajectory on a weathering model',
                    text: 'If you would like to see the trajectory prediction for this model please set-up the model accordingly.',
                    type: 'error',
                    confirmButtonText: 'Add Trajectory',
                    cancelButtonText: 'Back to Weathering',
                    showCancelButton: true,
                }, function(isConfirm){
                    if(isConfirm){
                        webgnome.router.navigate('config', true);
                        localStorage.setItem('prediction', 'both');
                    } else {
                        webgnome.router.views[1].switchView();
                    }
                });
            } else if (view === 'fate' && localStorage.getItem('prediction') === 'trajectory'){
                swal({
                    title: 'Unable to run weathering on a trajectory model',
                    text: 'If you would like to see the weathering prediction for this model please set-up the model accordingly.',
                    type: 'error',
                    confirmButtonText: 'Add Weathering',
                    cancelButtonText: 'Back to Trajectory',
                    showCancelButton: true,
                }, function(isConfirm){
                    if(isConfirm){
                        webgnome.router.navigate('config', true);
                        localStorage.setItem('prediction', 'both');
                    } else {
                        webgnome.router.views[1].switchView();
                    }
                });
            }

            if(view == 'fate'){
                this.renderFate();
                this.$el.css('height', 'auto');
            } else {
                this.renderTrajectory();
                this.updateHeight();
            }
        },

        reset: function(){
            if(this.TreeView){
                this.TreeView.close();
            }
            if(this.TrajectoryView){
                this.TrajectoryView.close();
            }
            if(this.FateView){
                this.FateView.close();
            }
        },

        updateHeight: function(){
            var view = localStorage.getItem('view');
            if(view == 'trajectory'){
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