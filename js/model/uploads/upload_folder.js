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
                file.save(null, {wait: true});
            });

            // This will be called when an item is removed, popped or shifted
            this.on('remove',  function(file) {
                file.destroy({
                    success: function (model, respose, options) {
                        console.log("The model is deleted on the server");
                    },
                    error: function (model, xhr, options) {
                        console.log("Something went wrong deleting the model");
                    }
                });
            });

            // This will be called when an item is updated
            this.on('change', function(file) {
                console.log('UploadFolder:change:filesize: ' + file.get('size'));
                if (file.previous('name') !== file.get('name')) {
                    // Basically, we only change the name.  Other attributes
                    // will be filesystem properties, which we will treat as
                    // read-only.
                    console.log('UploadFolder: File got changed from: ' +
                                file.previous('name') + ' to: ' + file.get('name'));
                    file.set('prev_name', file.previous('name'), {silent:true});

                    file.save();
                }
            });
        },

        comparator: function(file) {
            return [file.get("type"), file.get("name")];
        },

        parse: function(data) {
            return data;
        }
    });

    return UploadFolder;
});
