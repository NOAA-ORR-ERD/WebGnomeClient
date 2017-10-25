define([
	'jquery',
    'underscore',
    'backbone',
    'model/uploads/file'
], function($, _, Backbone, FileModel) {
    'use strict';
    var UploadFolder = Backbone.Collection.extend({
        model: FileModel,
        subFolders: [],

        url: function() {
            return webgnome.config.api +
                   ['/uploads'].concat(this.subFolders).join('/');
        },

        initialize: function () {
            // This will be called when an item is added. pushed or unshifted
            this.on('add', function(model) {
                console.log('File got added: ' + model.name);
            });
            // This will be called when an item is removed, popped or shifted
            this.on('remove',  function(model) {
                console.log('File got removed: ' + model.name);
            });
            // This will be called when an item is updated
            this.on('change', function(model) {
                console.log('File got changed: ' + model.name);
            });
        },

        parse: function(data) {
            return data;
          }
    });

    return UploadFolder;
});
