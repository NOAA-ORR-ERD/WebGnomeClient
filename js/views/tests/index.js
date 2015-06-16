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
    'views/tests/weatherer',
    'views/tests/help',
    'views/tests/special',
    'views/tests/run'
], function($, _, Backbone, TestTemplate, ModelTests,
    SpillTests, MapTests, LocationTests, EnvironmentTests,
    WeathererTests, HelpTests, SpecialTests,
    RunTests){
    'use strict';
    var testView = Backbone.View.extend({
        className: 'container page',
        initialize: function(){
            this.render();
            ModelTests.run();
            SpillTests.run();
            MapTests.run();
            EnvironmentTests.run();
            WeathererTests.run();
            HelpTests.run();
            LocationTests.run();
            SpecialTests.run();
            RunTests.run();
            

            QUnit.load();
            QUnit.start();
        },
        render: function(){
            $('body').append(this.$el.append(_.template(TestTemplate)));
        }
        
    });

    return testView;
});