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
            this.on('add', function(file) {
                console.log('File got added: ' + file.get('name'));
                file.save();
            });
            // This will be called when an item is removed, popped or shifted
            this.on('remove',  function(file) {
                console.log('File got removed: ' + file.get('name'));
                file.delete();
            });
            // This will be called when an item is updated
            this.on('change', function(file) {
                console.log('UploadFolder: File got changed from: ' + file.previous('name') +
                            ' to: ' + file.get('name'));

                file.set('new_name', file.get('name'), {silent:true});
                file.set('name', file.previous('name'), {silent:true});

                file.save();
            });
        },

        parse: function(data) {
            return data;
          }
    });

    return UploadFolder;
});
