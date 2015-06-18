// set up the app
require([
    '/../app',
    'tests/tests'
], function(App){
    'use strict';
    window.webgnome = App;
    webgnome.config();
    webgnome.initialize();
});