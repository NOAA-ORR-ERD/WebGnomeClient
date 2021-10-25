define([
    'jquery',
    'underscore',
    'backbone',
    'views/base',
    'text!templates/panel/time-check-popover.html',
], function($, _, Backbone, BaseView, TimeCheckPopoverTemplate){
    var panelBase = BaseView.extend({

        events: {
            'click .new, .add': 'new',
            'click .edit': 'edit',
            'click .delete': 'delete',
            'mouseover .single': 'hover',
            'mouseout .list': 'unhover',
            'click input[id="active"]': 'active',
            'dblclick .time-check': 'timeValidDblClick',
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

        setupTooltips: function(options){
            //TODO: implement options passing
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

            this.$('.trash').tooltip({
                container: 'body',
                delay: delay
            });
            this.$('.edit').tooltip({
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

            this.$('.time-check').popover({
                html: true,
                content: function(){ //this == the span the popover is attached to
                    var id_ = $(this).parents('.single').attr('data-id');
                    var model = webgnome.obj_ref[id_];
                    if (_.isUndefined(model.timeValidStatusGenerator)){
                        return 'Need to add status generation function!'
                    }
                    var validInfo = model.timeValidStatusGenerator();
                    var rv = $('<div>');
                    rv.append($('<div class="ttmsg">').text(validInfo.msg))
                    rv.append($('<div class="ttinfo">').text(validInfo.info))
                    if (validInfo.valid !== 'valid' && !_.isUndefined(validInfo.correction)){
                        rv.append($('<div class="ttcorr">').text('Double click to ' + validInfo.corrDesc))
                    }
                    return rv[0].outerHTML;
                },
                template: TimeCheckPopoverTemplate.substring(1, TimeCheckPopoverTemplate.length-1), //DIRTY HACK to remove grave chars
                container: 'body',
                delay: delay,
                trigger: 'hover',
                placement: 'auto top'
            });
        },

        timeValidDblClick: function(e) {
            //fires the time interval corrective function, if any available;
            var id_ = $(e.currentTarget).parents('.single').attr('data-id');
            var model = webgnome.obj_ref[id_];
            validInfo = model.timeValidStatusGenerator();
            if (!_.isUndefined(validInfo.correction)){
                validInfo.correction();
                $(e.currentTarget).popover("destroy");
            }
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