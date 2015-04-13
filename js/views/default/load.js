define([
    'jquery',
    'underscore',
    'backbone',
    'dropzone',
    'model/gnome',
    'text!templates/default/load.html',
    'text!templates/default/dropzone.html'
], function($, _, Backbone, Dropzone, GnomeModel, LoadTemplate, DropzoneTemplate){
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
            this.dropzone.on('uploadprogress', _.bind(this.progress, this));
            this.dropzone.on('success', _.bind(this.loaded, this));
            this.dropzone.on('sending', _.bind(this.sending, this));
        },

        sending: function(e, xhr, formData){
            formData.append('session', localStorage.getItem('session'));
        },

        reset: function(file){
            setTimeout(_.bind(function(){
                this.$('.dropzone').removeClass('dz-started');
                this.dropzone.removeFile(file);
            }, this), 1500);
        },

        progress: function(e, percent){
            if(percent == 100){
                this.$('.dz-preview').addClass('dz-uploaded');
                this.$('.dz-loading').fadeIn();
            }
        },

        loaded: function(){
            webgnome.model = new GnomeModel();
            webgnome.model.fetch({
                success: function(){
                    localStorage.setItem('prediction', 'both');
                    webgnome.router.navigate('setup', true);
                }
            });
        },

        close: function(){
            this.dropzone.disable();
            $('input.dz-hidden-input').remove();
            Backbone.View.prototype.close.call(this);
        }
    });

    return loadView;
});