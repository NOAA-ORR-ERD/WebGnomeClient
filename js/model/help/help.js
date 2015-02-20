define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone, swal){
    var helpModel = Backbone.Model.extend({
        urlRoot: '/help',

        defaults: {
            response: '',
            helpful: false
        },

        makeExcerpt: function(){
            var topicBody = $('<div>' + this.get('html') + '</div>');
            topicBody.find('h1').remove();
            return topicBody.text().substring(0,150).replace(/\n/g, ' ') + '...';
        }
    });

    return helpModel;
});