var assert = require("assert");
var url = 'http://0.0.0.0:8080';

describe('Application', function () {

    before(function(done){
        browser
            .url(url)
            .waitForExist('.setup.btn', 10000)
            .call(done);
    });

    it('should start', function (done) {
        browser
            .getTitle(function(err, title){
                assert(title === 'WebGNOME', 'Title is WebGNOME');
            })
            .call(done);
    });

    it('should have a button on the main page to get started', function(done){
        browser
            .isExisting('.setup.btn', function(err, exists){
                assert(exists, 'Get started button is present');
            })
            .call(done);
    });

    it('should route to the setup/config page when setup model is clicked', function(done){
        browser
            .click('.setup.btn')
            .isExisting('.page.setup', function(err, exists){
                assert(exists, 'the correct page was rendered');
            })
            .call(done);
    });
});

// describe('Setup page', function(){
//     // it('should have ')
// });