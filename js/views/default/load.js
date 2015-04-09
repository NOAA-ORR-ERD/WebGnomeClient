define([
    'jquery',
    'underscore',
    'backbone',
    'dropzone',
    'text!templates/default/load.html',
    'text!templates/default/dropzone.html'
], function($, _, Backbone, Dropzone, LoadTemplate, DropzoneTemplate){
    var loadView = Backbone.View.extend({
        className: 'page load',
        initialize: function(){

            this.render();
        },

        render: function(){
            var template = _.template(LoadTemplate);

            this.$el.html(template);

            $('body').append(this.$el);

            this.dropzone = new Dropzone('.dropzone', {
                url: webgnome.config.api + '/upload',
                previewTemplate: _.template(DropzoneTemplate)(),
                paramName: 'new_model',
                maxFiles: 1,
                acceptedFiles: 'application/zip',
                dictDefaultMessage: 'Drop model zip file here to load (or click to navigate)'
            });
            this.dropzone.on('error', _.bind(this.reset, this));
        },

        reset: function(file){
            setTimeout(_.bind(function(){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 1500);
        }
    });

    return loadView;
});