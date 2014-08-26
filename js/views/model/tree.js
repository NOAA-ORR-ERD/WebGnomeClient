define([
    'jquery',
    'underscore',
    'backbone',
    'views/modal/base',
    'fancytree'
], function($, _, Backbone, ModalView){
    var treeView = Backbone.View.extend({
        className: 'tree opened',
        open: true,
        width: '30%',
        debugOn: false,

        initialize: function(){
            webgnome.router.views[0].on('debugTreeToggle', _.bind(function(){this.renderModel(true);}, this), this);
            this.render();
        },

        render: function(){
            this.$el.html('<div class="model-tree"><div class="resize"></div></div>');
            this.renderModel();
            webgnome.model.on('sync', this.renderModel, this);
        },

        toggle: function(){
            if(this.open){
                this.open = false;
                this.offset = this.$('.resize').innerWidth();
                this.$el.css({width: 0, paddingRight: this.offset}).removeClass('opened').addClass('closed');
            } else {
                this.open = true;
                this.$el.css({width: this.width, paddingRight: 0}).addClass('opened').removeClass('closed');
            }

            return this.offset;
        },

        renderModel: function(attrs){
            if(webgnome.hasModel()){
                if (attrs){
                    this.debugOn = !this.debugOn;
                }
                if (this.debugOn){
                    var model_tree = webgnome.model.toDebugTree();
                } else {
                    var model_tree = webgnome.model.toTree();
                }
                if(this.$('.model-tree .ui-fancytree').length === 0){
                    this.$('.model-tree').fancytree({
                        source: model_tree,
                        dblclick: _.bind(function(event, data){
                            var action = data.node.data.action;
                            var form = webgnome.getForm(data.node.data.object.get('obj_type'));
                            var object = data.node.data.object;

                            if(form){
                                if(action === 'edit'){
                                    require([form], _.bind(function(Form){
                                        var view = new Form(null, object);
                                        view.on('hidden', view.close);
                                        view.on('hidden', function(){
                                            webgnome.model.trigger('sync');
                                        })
                                        view.render();
                                    }, this));
                                    
                                } else {
                                    // how am I going to create an object/know what object needs to be created
                                }
                            } else {
                                this.modal = new ModalView({
                                    title: 'No Form Found',
                                    body: 'No form was found to edit or create the object you selected',
                                    buttons: '<a href="" data-dismiss="modal" class="btn btn-primary">Ok</a>'
                                });
                                this.modal.render();
                                console.log('did not find form for ' + object.get('obj_type'));
                            }
                            return false;
                        }, this)
                    });
                } else {
                    this.tree = this.$('div:ui-fancytree').data('uiFancytree').getTree();
                    this.tree.reload(model_tree);
                }
            }
        }
    });

    return treeView;
});