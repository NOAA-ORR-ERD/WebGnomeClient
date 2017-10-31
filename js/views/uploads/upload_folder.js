define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/uploads/upload_folder.html',
    'text!templates/uploads/uploaded_file.html',
    'model/uploads/upload_folder',
    'model/uploads/file',
    'views/uploads/create_file_modal'
], function($, _, Backbone,
            UploadFolderTemplate, FileItemTemplate,
            UploadFolder, FileModel, CreateFileModal) {
    var UploadFolderView = Backbone.View.extend({
        model: new UploadFolder(),
        events: function(){
            return {
                'click .open-file': 'activateFile',
                'click .open-folder': 'openFolder',
                'click .new-folder': 'createNewFolderView',
                'click .breadcrumb li': 'useBreadcrumbFolder',
            };
        },

        initialize: function(options){
            this.template = _.template(UploadFolderTemplate);

            console.log('UploadFolderView is initialized.');
        },

        render: function(){
            this.$el.html(this.template());

            this.model.bind("reset", _.bind(this.renderFileList, this));
            this.model.bind("add", _.bind(this.renderFileList, this));
            this.model.fetch({reset: true});

            return this;
        },

        renderFileList: function(uploadFolder) {
            var thisForm = this;
            var fileList = this.$('tbody#file_list').empty();
            var fileItemTemplate = _.template(FileItemTemplate);

            this.model.each(function (file, index) {
                $(fileList).append(fileItemTemplate({'file': file}));
                if (file.get('type') === 'f') {
                    var fileListItem = fileList[0].children[index];
                    fileListItem.draggable = true;
                    fileListItem.ondragstart= function (ev) {
                        var fileName = ev.target.firstElementChild.textContent;
                        ev.dataTransfer.setData("file", fileName);
                    };
                    fileListItem.ondragend = function(ev) {
                        if(ev.dataTransfer.dropEffect !== 'none'){
                            $(this).remove();
                        }
                    };
                } else if (file.get('type') === 'd') {
                    fileList[0].children[index].ondragover = function (ev) {
                        ev.preventDefault();
                    };
                    $(fileList[0].children[index]).bind("drop",
                                                        _.bind(thisForm.moveFile, thisForm));
                }
            });

            var breadcrumbs = this.$('.breadcrumb').empty();
            breadcrumbs.append($('<li>').append('uploads'));

            $(this.model.subFolders).each(function (index, folder) {
                breadcrumbs.append($('<li>').append(folder));
            });
        },

        moveFile: function(e, data) {
            var fileToMove = e.originalEvent.dataTransfer.getData('file');
            var destinationFolder = e.target.textContent;
            var fileToChange = this.model.where({name: fileToMove})[0];

            console.log('moving file ' + fileToMove + ' to folder ' + destinationFolder);
            fileToChange.set('name', destinationFolder);
        },

        activateFile: function(e) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;
                var parentRow = this.$(e.target).parents('tr')[0];                
                var fileName = parentRow.cells[0].innerText;
                var filePath = this.model.subFolders.concat(fileName).join('/');

                this.trigger('activate-file', filePath);
            }
        },

        openFolder: function(e) {
            if (this.$('.popover').length === 0) {
                var parentRow = this.$(e.target).parents('tr')[0];                
                var folderName = parentRow.cells[0].innerText;

                var breadcrumbs = this.$('.breadcrumb');
                breadcrumbs.append($('<li>').append(folderName));

                this.model.subFolders.push(folderName);                
                this.model.fetch({reset: true});
            }
        },

        createNewFolderView: function(e) {
            if (this.$('.popover').length === 0) {
                this.fileModel = new FileModel({name: 'new_folder',
                                                size: 0,
                                                type: 'd'});
                this.createFileView = new CreateFileModal({}, this.fileModel);
                this.createFileView.render();
                this.createFileView.on('save', _.bind(this.createNewFolder, this));
            }
        },

        createNewFolder: function(e, model) {
            if (this.$('.popover').length === 0) {
                this.model.add(this.fileModel);
            }
        },

        useBreadcrumbFolder: function(e) {
            if (this.$('.popover').length === 0) {
                this.model.subFolders.length = $(e.target).index();
                this.model.fetch({reset: true});
            }
        }

    });

    return UploadFolderView;
});
