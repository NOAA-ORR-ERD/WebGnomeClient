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

        parse: function(response){
            var docs = $('<div>' + response.html + '</div>').find('.document');
            var html = '';
            _.each(docs, function(doc){
                $(doc).attr('id', 'help-' + $(doc).attr('id'));
                html += $('<div>').append(doc).html();
            });
            response.html = html;
            console.log(response.html);
            return response;
        },

        makeExcerpt: function(){
            var topicBody = $('<div>' + this.get('html') + '</div>');
            topicBody.find('h1').remove();
            return topicBody.text().substring(0,150).replace(/\n/g, ' ') + '...';
        }
    });

    return helpModel;
});