define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/tests/index.html',
    'views/tests/model',
    'views/tests/spill',
    'views/tests/map'
], function($, _, Backbone, TestTemplate, ModelTests, SpillTests, MapTests){
    testView = Backbone.View.extend({
        className: 'container page',
        initialize: function(){
            this.render();
            ModelTests.run();
            SpillTests.run();
            MapTests.run();
            
            QUnit.load();
            QUnit.start();
        },
        render: function(){
            $('body').append(this.$el.append(_.template(TestTemplate)));
        }
        
    });

    return testView;
});