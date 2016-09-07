define([
    'underscore',
    'backbone'
], function(_, Backbone) {
	'use strict';
	var fileOutput = Backbone.Model.extend({
		url: '/export',

		initialize: function(options) {
			if (!_.isUndefined(options.obj_id)) {
				this.url = '/export/output/' + options.obj_id;
			}
		}
	});

	return fileOutput;
});