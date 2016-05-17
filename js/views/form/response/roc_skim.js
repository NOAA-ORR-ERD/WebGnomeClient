define([
    'jquery',
    'underscore',
    'backbone',
    'views/form/response/base',
    'text!templates/form/response/roc_skim.html'
], function($, _, Backbone, BaseResponseForm, ROCSkimTemplate){
    var ROCSkimForm = BaseResponseForm.extend({
        title: 'ROC Skim Response',
        size: 'lg',

        render: function(){
            var compiled = _.template(ROCSkimTemplate, this.model.attributes);
            this.body = compiled;
            BaseResponseForm.prototype.render.call(this);
        }
    });
    return ROCSkimForm;
});