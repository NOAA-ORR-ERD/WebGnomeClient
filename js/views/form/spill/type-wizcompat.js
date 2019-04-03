define([
    'underscore',
    'views/form/spill/type',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'model/spill/spill'
], function(_,SpillTypeForm, InstantSpill, ContSpill, GnomeSpill){
    var SpillForm = SpillTypeForm.extend({
        instant: function(){
            var spill = new GnomeSpill();
            var spillForm = new InstantSpill(null, spill);
            spillForm.on('save', _.bind(function(model) {
                webgnome.model.get('spills').add(spillForm.model);
            }, this));
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        },

        continue: function(){
            var spill = new GnomeSpill();
            var spillForm = new ContSpill(null, spill);
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        }
    });

    return SpillForm;
});