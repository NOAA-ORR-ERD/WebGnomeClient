define([
    'underscore',
    'views/form/spill/type',
    'views/form/spill/instant',
    'views/form/spill/continue',
    'model/spill/spill'
], function(_,SpillTypeForm, SpillInstantForm, SpillContinueForm, SpillModel){
    var SpillForm = SpillTypeForm.extend({
        instant: function(){
            var spill = new SpillModel();
            var rel = spill.get('release');
            rel.set('end_release_time', rel.get('release_time'));
            var spillForm = new SpillContinueForm(null, spill);
            spillForm.on('save', _.bind(function(model) {
                webgnome.model.get('spills').add(spillForm.model);
            }, this));
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        },

        continue: function(){
            var spill = new SpillModel();
            var rel = spill.get('release');
            var rt = moment(rel.get('release_time')).add(1, 'hr');
            rel.set('end_release_time', rt.format(webgnome.config.date_format.moment));
            var spillForm = new SpillContinueForm(null, spill);
            spillForm.on('save', _.bind(function(model) {
                webgnome.model.get('spills').add(spillForm.model);
            }, this));
            this.on('hidden', function(){
                spillForm.render();
            });
            this.trigger('select', spillForm);
        }
    });

    return SpillForm;
});