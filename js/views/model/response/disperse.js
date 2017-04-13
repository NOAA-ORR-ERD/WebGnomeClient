define([
    'views/model/response/list',
    'text!templates/model/response/disperse.html'
], function(BaseListView, DisperseListTemplate){
    var disperseListView = BaseListView.extend({
        process: 'Dispserse',
        template: DisperseListTemplate
    });
    return disperseListView;
});