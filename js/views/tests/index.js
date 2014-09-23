define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/tests/index.html',
    'views/tests/model',
    'views/tests/spill'
], function($, _, Backbone, TestTemplate, ModelTests, SpillTests){
    testView = Backbone.View.extend({
        className: 'container page',
        initialize: function(){
            this.render();
            ModelTests.run();
            SpillTests.run();
            
            QUnit.load();
            QUnit.start();
        },
        render: function(){
            $('body').append(this.$el.append(_.template(TestTemplate)));
        }
        
    });

    return testView;
});