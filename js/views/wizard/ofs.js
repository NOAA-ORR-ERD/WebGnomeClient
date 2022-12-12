define([
    'underscore',
    'views/wizard/base',
    'views/form/model',
    'views/form/water',
    'views/form/mover/wind_type',
    'views/form/map/type',
    'views/form/spill/type',
    'views/form/text',
    'views/form/mover/goods',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water',
], function(_, BaseWizard, ModelForm, WaterForm, WindTypeForm, MapTypeForm, SpillTypeForm, TextForm, GoodsMoverForm,
        GnomeModel, WindModel){
    var ofsWizard = BaseWizard.extend({
        initialize: function(){
            webgnome.model = new GnomeModel({name: 'Model'});
            webgnome.model.save(null, {
                validate: false,
                error: this.fail,
                success: _.bind(this.setup, this)
            });
        },

        setup: function(){
            var s1, s2, s3, s4;
            s1 = new ModelForm({
                name: 'step1',
                title: 'Model Settings <span class="sub-title">OFS Wizard</span>',
                buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="next">Next</button>',
            }, webgnome.model);
            s2 = new GoodsMoverForm({
                name: 'step2',
                size: 'xl',
                request_type: 'currents',
                wizard: true,
            });
            s2.listenTo(s2, 'select', _.bind(function(form){
                    form.title += '<span class="sub-title">OFS Wizard</span>';
                    form.name = 'step2';
                    form.render();
                    s2.listenTo(form, 'hidden', s2.close)
                    this.listenToOnce(form, 'success', _.bind(function(req){
                        if (req.include_winds){
                            this.step += 1;
                            this.next();
                            form.hide();
                        } else{
                            this.next();
                        }
                    },this));
                }, this)
            );

            this.steps = [
                s1,
                s2,
                new WindTypeForm({
                    name: 'step3',
                    title: 'Select Wind Type <span class="sub-title">OFS Wizard</span>',
                }),
                new SpillTypeForm({
                    name: 'step4',
                    title: 'Select Spill Type <span class="sub-title">GNOME Wizard</span>'
                }),
                new WaterForm()
            ];

            this.start();
            
            this.steps[2].listenToOnce(this.steps[1], 'success', _.bind(function(reqObj){
                if (reqObj.request_type.includes('surface winds')){
                    this.next();
                    steps[2].hide();
                }
            }, this));
        }
    });

    return ofsWizard;
});