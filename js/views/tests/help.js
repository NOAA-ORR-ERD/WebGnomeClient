define([
	'jquery',
    'underscore',
    'backbone',
    'collection/help',
    'model/help/help'
], function($, _, Backbone, HelpCollection, HelpModel){
    'use strict';
		var helpTests = {
			run: function(){
				QUnit.module('Help');
				this.test();
			},

			test: function(){
				asyncTest('Create help collection', function(){
					var helpCollection = new HelpCollection();
					helpCollection.fetch({
						validate: false,
						success: function(collection){
							ok(!_.isUndefined(collection.models), 'help was populated with models');
							ok(!_.isUndefined(collection.search('oil')), 'help search method works!');
							start();
						},
						error: function(collection){
							ok(!_.isUndefined(collection.models), 'help was populated with models');
							ok(!_.isUndefined(collection.search('oil')), 'help search method works!');
							start();
						}
					});
				});
			}
		};
	return helpTests;
});
