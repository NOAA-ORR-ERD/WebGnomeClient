define([
    'views/model/response/list',
    'text!templates/model/response/skim.html'
], function(BaseListView, SkimListTemplate){
    var skimListView = BaseListView.extend({
        process: 'Skim',
        template: SkimListTemplate
    });
    return skimListView;
});