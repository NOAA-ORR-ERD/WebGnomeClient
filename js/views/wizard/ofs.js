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
    'views/form/diffusion',
    'model/gnome',
    'model/environment/wind',
    'model/environment/water',
], function(_, BaseWizard, ModelForm, WaterForm, WindTypeForm, MapTypeForm, SpillTypeForm, TextForm, GoodsMoverForm, DiffusionForm,
        GnomeModel, WindModel){
    var ofsWizard = BaseWizard.extend({
        initialize: function(){
        },

        setup: function(){
            var s1, s2, s3, s4, s5, s6;
            s1 = new ModelForm({
                name: 'step1',
                title: 'Model Settings <span class="sub-title">OFS Wizard</span>',
                buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="next">Next</button>',
            }, webgnome.model);
            s1.listenTo(s1, 'hidden', _.bind(s1.close,s1));
            s2 = new GoodsMoverForm({
                name: 'step2',
                size: 'xl',
                request_type: 'currents',
                wizard: true,
            });
            s2.listenTo(s2, 'select', _.bind(function(form){
                    //Subset form
                    form.buttons = '<button type="button" class="wizard-cancel">Back</button><button type="button" class="submit">Submit</button>';
                    form.name = 'step2';
                    form.render();
                    s2.hide();
                    s2.listenToOnce(form, 'cancel', _.bind(s2.show, s2));
                    s2.listenToOnce(form, 'success', _.bind(s2.close,s2));
                    this.listenToOnce(form, 'success', _.bind(function(req){
                        if (req.include_winds){
                            this.step += 1;
                            this.next();
                        } else{
                            this.next();
                        }
                    },this));
                }, this)
            );
            s3 = new WindTypeForm({
                name: 'step3',
                title: 'Select Wind Type <span class="sub-title">OFS Wizard</span>',
            });
            this.listenTo(s3, 'select', _.bind(function(form){
                //Can be upload, goods wind, or point wind
                form.name = 'step3';
                form.buttons = '<button type="button" class="wizard-cancel">Cancel</button><button type="button" class="save">Next</button>';
                s3.listenToOnce(form, 'prev', s3.show);
                s3.listenToOnce(form, 'cancel', s3.show, s3);
                s3.listenToOnce(form, 'close', s3.show, s3);
                this.listenToOnce(form, 'hidden', _.bind(function(){
                    form.close();
                    s3.close();
                },this));
            },this));

            s4 = new SpillTypeForm({
                name: 'step4',
                title: 'Select Spill Type <span class="sub-title">GNOME Wizard</span>'
            });
            this.listenTo(s4, 'select', _.bind(function(form){
                //Spill form
                form.title += '<span class="sub-title">OFS Wizard</span>';
                form.name = 'step4';
                form.buttons = '<button type="button" class="wizard-cancel">Cancel</button><button type="button" class="save">Next</button>';
                s4.listenToOnce(form, 'cancel', s4.show);
                s4.listenToOnce(form, 'save', s4.close);
                this.listenToOnce(form, 'save', _.bind(function(spill){
                    if (!spill.get('substance').get('is_weatherable')){
                        this.step += 1;
                        this.next();
                    } else{
                        this.next();
                    }
                },this));
            },this));
            
            s5 = new WaterForm({
                name: 'step5'
            });

            s6 = new DiffusionForm({
                name: 'step6'
            });
            this.listenTo(s6, 'save', _.bind(function(model){
                webgnome.model.get('movers').add(s6.model, {merge: true});
                webgnome.model.save(null, {validate: false});
                s6.on('hidden', s6.close);
            },this));

            var finishForm = new TextForm({
                title: 'Finished',
                body: "<div><p>Pressing the <b>Run Model</b> button will now take you to the <b>Map View</b> where you can visualize the spill movement.</p> <p>You can switch between Views by using the icons shown below which will appear at the top right of your browser window.<ul><li> To make modifications to your model setup, switch to <b>Setup View</b>.</li> <li> To view the oil budget, switch to <b>Fate View.</b></li></ul></p><p><img src='img/view_icons.png' alt='Image of View icons' style='width:473px;height:180px;'></p></div>",
                buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='finish' data-dismiss='modal'>Run Model</button>"
            });

            finishForm.on('finish', function() {
                webgnome.model.save().always(_.bind(function() {
                    this.trigger('wizard_complete');
                },this));
            });


            this.steps = [
                s1,
                s2,
                s3,
                s4,
                s5,
                s6,
                finishForm
            ];

            this.start();
        }
    });

    return ofsWizard;
});