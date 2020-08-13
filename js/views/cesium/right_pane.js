define([
    'jquery',
    'underscore',
    'views/base',
    'module'
], function ($, _, BaseView, module) {
    "use strict";
    var rightContentPane = BaseView.extend({
        events: {
            'click .right-tab': 'toggleContentPane'
        },
        className: 'right-content-pane',

        initialize: function(views, options){
            this.module = module;
            BaseView.prototype.initialize.call(this, options);
            this.tabContainer = $('<div class="right-tab-container"></div>');
            this.$el.append(this.tabContainer);
            this.tabs = [];
            for (var i = 0; i < views.length; i++) {
                var name = views[i].className;
                name = name.charAt(0).toUpperCase() + name.slice(1);
                var tab = $('<div class=right-tab>'+name+'</div>');
                this.tabContainer.append(tab);
                this.tabs.push([name, tab, views[i]]);
                this.$el.append(views[i].$el);
                views[i].$el.hide();
            }
            this.views = views;
        },

        toggleContentPane: function(e) {
            console.log(e);
            var name = e.currentTarget.innerText;
            for (var i = 0; i < this.tabs.length; i++) {
                var tabName = this.tabs[i][0];
                var tab = this.tabs[i][1];
                var view = this.tabs[i][2];
                if (tabName === name) {
                    if (tab.hasClass('active')) {
                        tab.removeClass('active');
                        this.$el.removeClass('expanded');
                    } else {
                        tab.addClass('active');
                        this.$el.addClass('expanded');
                        view.$el.show();
                    }
                } else {
                    tab.removeClass('active');
                    view.$el.hide();
                }
            }
        }
    });
    return rightContentPane;
});