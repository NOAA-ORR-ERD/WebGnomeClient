var assert = require("assert");
var url = 'http://0.0.0.0:8080';
var async_timeout = 300000;
var animation_pause = 1000;

describe('SSC Demo', function(){
    before(function(done){
        browser
            .setViewportSize({
                width: 1177,
                height: 1050
            })
            .url(url)
            .waitForExist('.setup.btn', async_timeout)
            .click('.setup.btn')
            .click('.logger .toggle')
            .call(done);
    });

    it('should start with a new model', function(done){
        browser
            .waitForExist('#navbar-main', async_timeout)
            .click('#navbar-main .model')
            .click('#navbar-main .model .new')
            .waitForExist('.sweet-alert button.confirm', async_timeout)
            .click('.sweet-alert button.confirm')
            .isVisible('.stage-2', function(err, visible){
                assert(visible[0] === false && visible[1] === false, 'stage 2 is not visible');
            })
            .isExisting('.icon.selected', function(err, existing){
                assert(existing === false, 'no mode is selected');
            })
            .click('.icon.fate')
            .setValue('#days', 7)
            .call(done);
    });

    it('should have a spill', function(done){
        browser
            .waitForVisible('.spill.object', async_timeout)
            .pause(animation_pause + animation_pause)
            .click('.spill.object .add')
            .pause(animation_pause)
            .click('.option.continue')
            .waitForExist('.modal .constant')
            .pause(animation_pause)
            .setValue('.modal #days', 7)
            .click('.modal .constant')
            .setValue('#spill-rate', 1240)
            .click('.modal #constant .slider')
            .click('.substanceinfo')
            .pause(animation_pause)
            .click('.oil-select')
            .waitForExist('.oil-form.modal', async_timeout)
            .pause(animation_pause)
            .setValue('#search', 'louisianna sweet')
            .pause(animation_pause)
            .moveToObject('.oil-form.modal th.location', 0, 40)
            .leftClick()
            .leftClick()
            .click('.oil-form.modal .save')
            .waitForVisible('.continuespill-form .save', async_timeout)
            .pause(animation_pause)
            .click('.continuespill-form .save')
            .pause(animation_pause)
            .isExisting('.spill.object .single', function(err, exisiting){
                assert(exisiting, 'spill exists');
            })
            .call(done);
    });

    it('should have a wind', function(done){
        browser
            .click('.wind.object .add')
            .pause(animation_pause)
            .click('.variable a')
            .waitForVisible('#incrementCount', async_timeout)
            .setValue('#incrementCount', 24)
            .setValue('#variable-speed', 7.5)
            .setValue('#variable-direction', 0)
            .click('.wind-form .add')
            .setValue('#variable-speed', 12.5)
            .click('.wind-form .add')
            .setValue('#variable-speed', 17.5)
            .click('.wind-form .add')
            .setValue('#variable-speed', 7.5)
            .click('.wind-form .add')
            .setValue('#variable-speed', 7.5)
            .click('.wind-form .add')
            .setValue('#variable-speed', 12.5)
            .click('.wind-form .add')
            .setValue('#variable-speed', 17.5)
            .click('.wind-form .add')
            .click('.wind-form #variable .slider')
            .pause(animation_pause)
            .click('.wind-form .save')
            .pause(animation_pause)
            .isExisting('.wind.object .complete', function(err, existing){
                assert(existing, 'wind object exists');
            })
            .call(done);
    });

    it('should have a water', function(done){
        browser
            .click('.water.object .add')
            .pause(animation_pause)
            .setValue('.modal #temp', 70)
            .click('.modal .save')
            .pause(animation_pause)
            .isExisting('.water.object .complete', function(err, existing){
                assert(existing, 'water object exists');
            })
            .call(done);
    });
});