define([
    'underscore',
    'backbone',
    'model/base'
], function(_, Backbone, BaseModel){
    'use strict';
    var spillOutputter = BaseModel.extend({
        urlRoot: '/outputter/',

        defaults: {
            'obj_type': 'gnome.outputters.json.SpillJsonOutput',
            'name': 'Outputter',
            'output_timestep': null,
            'output_last_step': 'true',
            'output_zero_step': 'true',
            '_additional_data': []
        },

        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
        },

        addListeners: function(webgnomeModel) {
            this.listenTo(webgnomeModel.get('spills'), 'change add remove', this.attachNewListener);
        },

        attachNewListener: function(spill) {
            this.listenTo(spill.get('_appearance'), 'change:data', this._updateRequestedDataTypes);
        },

        _updateRequestedDataTypes: function(dtype) {
            var spills = webgnome.model.get('spills');
            var _req_data = [];
            for (var i = 0; i < spills.length; i++) {
                var datum = spills.at(i).get('_appearance').get('data').toLowerCase();
                if (datum !== 'mass') {
                    _req_data.push(datum);
                }
            }
            _req_data = _req_data.length > 0 ? _.uniq(_req_data) : _req_data;
            console.log(_req_data);
            if (!_.isEqual(_req_data, this.get('_additional_data'))){
                this.set('_additional_data', _req_data);
                webgnome.model.trigger('rewind');
                this.save();
            }
        },

        toTree: function(){
            return '';
        }
    });

    return spillOutputter;
});