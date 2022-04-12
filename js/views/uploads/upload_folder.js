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
                'click .delete-file': 'deleteFile',
                'click .upload-d': 'selectRow',
                'click .upload-f': 'selectRow',
                'click .save': 'submitSelections'
            };
        },

        initialize: function(options){
            this.template = _.template(UploadFolderTemplate);
        },

        render: function(){
            this.$el.html(this.template());

            this.model.bind("reset add", _.bind(this.renderFileList, this));
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
                        var fileName = ev.target.firstElementChild.textContent.trim();
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

            breadcrumbs.children().each(function (index, crumb) {
                crumb.ondragover = function (ev) {
                    ev.preventDefault();
                };
                $(crumb).bind("drop", _.bind(thisForm.moveFileToBreadcrumb, thisForm));
            });
        },

        moveFile: function(e, data) {
            var thisForm = this;
            var subFolders = this.model.subFolders.slice();

            var fileToMove = e.originalEvent.dataTransfer.getData('file');
            var oldFilePath = '/' + subFolders.concat(fileToMove).join('/');
            var destinationFolder = e.target.textContent.trim();

            console.log('moving file ' + fileToMove + ' to folder ' + destinationFolder);
            var fileObj = new FileModel({name: fileToMove,
                                         prev_name: oldFilePath,
                                         size: 0,
                                         type: 'f'});
            
            fileObj.urlRoot = webgnome.config.api +
                              ['/uploads'].concat(subFolders).concat(destinationFolder).join('/');

            fileObj.save(null, {success: function() {
                thisForm.model.fetch({reset: true});
            }});
        },

        moveFileToBreadcrumb: function(e, data) {
            var thisForm = this;
            var fileToMove = e.originalEvent.dataTransfer.getData('file');
            var oldFilePath = '/' + this.model.subFolders.join('/') + '/' + fileToMove;

            var crumbIndex = $(e.target).index();
            var subFolders = this.model.subFolders.slice(0, crumbIndex);

            console.log('moving file ' + fileToMove + ' from old path ' + oldFilePath);
            var fileObj = new FileModel({name: fileToMove,
                                         prev_name: oldFilePath,
                                         size: 0,
                                         type: 'f'});
            fileObj.urlRoot = webgnome.config.api +
                              ['/uploads'].concat(subFolders).join('/');

            fileObj.save(null, {success: function() {
                thisForm.model.fetch({reset: true});
            }});
        },

        activateFile: function(e) {
            if (this.$('.popover').length === 0) {
                var thisForm = this;
                var parentRow = this.$(e.target).parents('tr')[0];                
                var fileName = parentRow.cells[0].innerText.trim();
                var filePath = this.model.subFolders.concat(fileName).join('/');

                this.trigger('activate-file', filePath);
            }
        },

        openFolder: function(e) {
            if (this.$('.popover').length === 0) {
                var parentRow = this.$(e.target).parents('tr')[0];                
                var folderName = parentRow.cells[0].innerText.trim();

                var breadcrumbs = this.$('.breadcrumb');
                breadcrumbs.append($('<li>').append(folderName));

                this.model.subFolders.push(folderName);                
                this.model.fetch({reset: true});
            }
        },

        deleteFile: function(e) {
            if (this.$('.popover').length === 0) {
                var parentRow = this.$(e.target).parents('tr')[0];                
                var fileName = parentRow.cells[0].innerText.trim();

                var file = this.model.findWhere({name: fileName});

                if (file) {
                    file.destroy({
                        success: function(model, response) {
                            parentRow.remove();
                        },
                        error: function (model, response) {
                            alert('failed to delete ' + fileName);
                        }
                    });
                } else {
                    console.log('file ' + fileName + ' not found in the collection');
                }
            }
        },

        createNewFolderView: function(e) {
            if (this.$('.popover').length === 0) {
                this.fileModel = new FileModel({name: 'new_folder',
                                                size: 0,
                                                type: 'd'});
                this.createFileView = new CreateFileModal({}, this.fileModel);
                this.createFileView.render();
                this.createFileView.once('save', _.bind(this.createNewFolder, this));
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
        },

        selectRow: function(e) {
            var clickedRow = $(e.currentTarget);
            var oldActive = $('tr.active');
            var selected = $('.info');
            var all = $('.upload-f');
            if (clickedRow.is(oldActive)) {
                if (e.shiftKey) {
                    return;
                }
                if (e.ctrlKey) {
                    clickedRow.toggleClass('info');
                    return;
                } else {
                    selected.removeClass('info');
                    clickedRow.addClass('info');
                    return;
                }
            } else {
                oldActive.removeClass('active');
                clickedRow.addClass('active');
                if (e.shiftKey) {
                    var oldActiveIdx = all.index(oldActive);
                    var clickedRowIdx = all.index(clickedRow);
                    if (!e.ctrlKey) {
                        //if ctrl key is not down, current selection is wiped before new rows added
                        selected.not(oldActive).removeClass('info');
                        oldActive.addClass('info');
                    }
                    if (clickedRowIdx < oldActiveIdx) {
                        $('.upload-f:gt(' + (clickedRowIdx-1) + ').upload-f:lt(' + oldActiveIdx + ')').addClass('info');
                    } else {
                        $('.upload-f:gt(' + (oldActiveIdx) + ').upload-f:lt(' + (clickedRowIdx) + ')').addClass('info');
                    }
                } else if (e.ctrlKey) {
                    clickedRow.toggleClass('info');
                } else {
                    selected.removeClass('info');
                    clickedRow.addClass('info');
                }
            }
        },

        submitSelections: function(e) {
            var selected = $('.upload-f.info');
            if (selected.length === 0) {
                selected = $('.upload-d.info');
                if (selected.length === 0) {
                    return;
                } else {
                    e.target = $('span.open-folder', selected)[0];
                    this.openFolder(e);
                    return;
                }
            }
            var names = selected.map(function() {return this.children[0].innerHTML.trim();}).get();
            var sf = this.model.subFolders;
            var paths = names.map(function(n) {
                return sf.concat(n).join('/');
            });
            $.post(webgnome.config.api + '/uploads',
                {
                    'action': 'activate_file',
                    'filelist': JSON.stringify(paths),
                    'session': localStorage.getItem('session')
                }
            ).done(_.bind(function(fileList) {
                this.trigger('activate-file', JSON.parse(fileList), names[0]);
            }, this));
        }

    });

    return UploadFolderView;
});
