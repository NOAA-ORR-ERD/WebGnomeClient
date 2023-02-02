define([
    'jquery',
    'underscore',
    'backbone',
    'views/default/swal',
    'model/movers/py_wind',
    'views/form/mover/upload',
    'text!templates/panel/griddedwind.html',
    'views/form/mover/py_wind',
    'views/panel/current',
    'views/form/mover/wind_type'
], function($, _, Backbone, swal,
            PyWindMover, MoverUploadForm, GriddedWindPanelTemplate,
            GriddedWindEditForm, CurrentPanel, WindMoverTypeForm) {
    var griddedWindPanel = CurrentPanel.extend({
        className: 'col-md-3 griddedwind object panel-view',

        models: [
            'gnome.movers.py_wind_movers.GridWindMover'
        ],
        events: {
            'click #mini-windmap': 'openMapModal',
            'click .single': 'changeDisplayedCurrent',
            'webkitfullscreenchange #mini-windmap': 'resetCamera',
            'mozfullscreenchange #mini-locmap' : 'resetCamera',
            'msfullscreenchange #mini-locmap' : 'resetCamera',
            'fullscreenchange #mini-locmap' : 'resetCamera',
            'click .cancel-request': 'cancelRequestHandler',
        },

        mapName: '#mini-windmap',

        template: GriddedWindPanelTemplate,

        envtype: 'surface winds',

        new: function() {
            var form = new WindMoverTypeForm({
            });
            form.on('hidden', form.close);
            form.render();
        },

        edit: function(e) {
            e.stopPropagation();
            var id = this.getID(e);

            var griddedwind = webgnome.model.get('movers').get(id);
            

            var griddedwindView = new GriddedWindEditForm({model: griddedwind});

            griddedwindView.on('save', function() {
                griddedwindView.on('hidden', griddedwindView.close);
            });

            griddedwindView.on('wizardclose', griddedwindView.close);

            griddedwindView.render();
        },

        delete: function(e) {
            e.stopPropagation();

            var id = this.getID(e);
            var spill = webgnome.model.get('movers').get(id);

            swal.fire({
                title: 'Delete "' + spill.get('name') + '"',
                text: 'Are you sure you want to delete this wind?',
                icon: 'warning',
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                showCancelButton: true
            }).then(_.bind(function(deleteWind) {
                if (deleteWind.isConfirmed) {
                    var mov = webgnome.model.get('movers').get(id);
                    var envs = webgnome.model.get('environment');
                    if (mov.get('obj_type') === 'gnome.movers.py_wind_movers.GridWindMover') {
                        var env_id = mov.get('wind').get('id');

                        for (var i = 0; i < envs.length; i++) {
                            if (envs.models [i].get('id') === env_id) {
                                envs.remove(env_id);
                            }
                        }
                    }
                    webgnome.model.get('movers').remove(id);
                    webgnome.weatheringManageFunction();
                }
            }, this));
        },

        close: function() {
            if (this.currentMap) {
                this.currentMap.close();
            }

            CurrentPanel.prototype.close.call(this);
        },

        cancelRequestHandler: function(currentTarget){
            var ct = $(currentTarget.target);
            var id = ct.parents('.goods-request-row').attr('data-id');
            var mod = webgnome.goodsRequests.findWhere({'request_id': id});
            mod.cancel();
        },
    });

    return griddedWindPanel;
});
