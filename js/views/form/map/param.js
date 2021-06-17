define([
    'underscore',
    'views/modal/form',
    'text!templates/form/map/param.html',
    'model/map/param'
], function(_, FormModal, ParamTemplate, ParamMap){
    var paramMapForm = FormModal.extend({
        title: 'Parameterized Shoreline',
        riskAssess: false,

        initialize: function(options){
            if (options && _.has(options, 'riskAssess')) {
                this.riskAssess = options.riskAssess;
            }


            if(options && _.has(options, 'map')){
                this.model = options.map;
            } else {
                this.model = new ParamMap();
            }
            this.on('hidden', this.close);
            FormModal.prototype.initialize.call(this, options);
        },

        render: function(){
            this.body = _.template(ParamTemplate, {
                bearing: this.model.get('bearing'),
                distance: this.model.get('distance'),
                center: this.model.get('center')[0] + ',' + this.model.get('center')[1]
            });
            FormModal.prototype.render.call(this);
            this.$('select[name="units"]').find('option[value="' + this.model.get('units') + '"]').prop('selected', 'selected');
        },
        
        update: function(){
            this.model.set('distance', this.$('input[name="distance"]').val());
            this.model.set('units', this.$('select[name="units"]').val());
            this.model.set('bearing', this.$('input[name="bearing"]').val());
            this.model.set('center', this.$('input[name="center"]').val().split(','));
        },

        wizardclose: function() {
            if (this.riskAssess) {
                this.trigger('wizardclose');
            } else {
                FormModal.prototype.wizardclose.call(this);
            }
        }
    });

    return paramMapForm;
});