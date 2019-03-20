define([
    'jquery',
    'underscore',
    'backbone',
    'views/base'
], function($, _, Backbone, BaseView){
    var panelBase = BaseView.extend({

        events: {
            'click .new, .add': 'new',
            'click .edit': 'edit',
            'click .delete': 'delete',
            'mouseover .single': 'hover',
            'mouseout .list': 'unhover',
            'click input[id="active"]': 'active'
        },

        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);
            this.listenTo(webgnome.model, 'sync', this.render);
        },
        
        active: function(e) {
            e.stopPropagation();
            var active = e.target.checked;
            var id = this.getID(e);
            var current = webgnome.model.get('movers').get(id);
            if (_.isUndefined(current)) {
                current = webgnome.model.get('weatherers').get(id);
            }
            current.set('on',active);
            webgnome.model.save();
        },

        rerender: function(model, xhr){
            if(this.models){
                if(this.models.indexOf(model.get('obj_type')) !== -1){
                    this.render();
                }
            } else {
                this.render();
            }
        },

        why: function(model){
            console.log('Rerendering', this.$el, 'because', model.changed);
        },

        hover: function(e){
            if(this.dataset && this.plot){
                var id = this.getID(e);
                var coloredSet = [];
                for(var dataset in this.dataset){
                    var ds = $.extend(true, {}, this.dataset[dataset]);
                    if (this.dataset[dataset].id !== id){
                        ds.color = '#ddd';
                        ds.direction.fillColor = '#ddd';
                        ds.direction.color = '#ddd';
                    }

                    coloredSet.push(ds);
                }
                this.plot.setData(coloredSet);
                this.plot.draw();
            }
        },

        render: function(){
            this.setupTooltips();
            this.trigger('render');
        },

        unhover: function(){
            if(this.dataset && this.plot){
                this.plot.setData(this.dataset);
                this.plot.draw();
            }
        },

        setupTooltips: function(){
            var delay = {
                show: 500,
                hide: 100
            };

            this.$('.panel-heading .add').tooltip({
                title: _.bind(function(){
                    var object = this.$('.panel-heading').text().trim();

                    if(this.$('.panel').hasClass('complete') && this.$('.list .single').length === 0){
                        return 'Edit ' + object;
                    } else {
                        return 'Create ' + object;
                    }
                }, this),
                delay: delay,
                container: 'body'
            });

            this.$('.panel-heading .perm-add').tooltip({
                title: _.bind(function(){
                    var object = this.$('.panel-heading').text().trim();
                    return 'Replace ' + object;
                }, this),
                delay: delay,
                container: 'body'
            });

            this.$('.trash, .edit').tooltip({
                container: 'body',
                delay: delay
            });

            this.$('.panel-heading .state').tooltip({
                title: _.bind(function(){
                    var object = this.$('.panel-heading').text().trim();

                    if(this.$('.panel').hasClass('complete')){
                        return object + ' requirement met';
                    } else if(this.$('.panel').hasClass('optional')){
                        return object + ' optional';
                    } else {
                        return object + ' required';
                    }
                }, this),
                container: 'body',
                delay: delay
            });
        },

        getID: function(e){
            if(this.$(e.target).hasClass('single')){
                return this.$(e.target).data('id');
            } else {
                return this.$(e.target).parents('.single').data('id');
            }
        }
    });

    return panelBase;
});