define([
    'views/model/response/list',
    'text!templates/model/response/burn.html',
], function(BaseListView, BurnListTemplate){
    var burnResponseListView = BaseListView.extend({
        template: BurnListTemplate,
        process: 'Burned'
    });

    return burnResponseListView;
});
