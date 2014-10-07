define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/tests/index.html',
    'views/tests/model',
    'views/tests/spill',
    'views/tests/map',
    'views/tests/location',
    'views/tests/environment',
    'views/tests/weatherer'
], function($, _, Backbone, TestTemplate, ModelTests, SpillTests, MapTests, LocationTests, EnvironmentTests, WeathererTests){
    testView = Backbone.View.extend({
        className: 'container page',
        initialize: function(){
            this.render();
            ModelTests.run();
            SpillTests.run();
            MapTests.run();
            EnvironmentTests.run();
            WeathererTests.run();
            LocationTests.run();
            
            QUnit.load();
            QUnit.start();
        },
        render: function(){
            $('body').append(this.$el.append(_.template(TestTemplate)));
        }
        
    });

    return testView;
});