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
            var s1, s2, s3, s4, s5;
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
                    s2.listenTo(form, 'hidden', _.bind(s2.close,s2));
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
            s3 = new WindTypeForm({
                name: 'step3',
                title: 'Select Wind Type <span class="sub-title">OFS Wizard</span>',
            });
            this.listenTo(s3, 'select', _.bind(function(form){
                //Can be upload, goods wind, or point wind
                form.name = 'step3';
                form.render();
                this.listenTo(form, 'hidden', _.bind(function(){
                    this.next();
                    form.close();
                    s3.close();
                },this));
            },this));
            s4 = new SpillTypeForm({
                //Can be upload, goods wind, or point wind
                name: 'step4',
                title: 'Select Spill Type <span class="sub-title">GNOME Wizard</span>'
            });
            this.listenTo(s4, 'select', _.bind(function(form){
                form.title += '<span class="sub-title">OFS Wizard</span>';
                form.name = 'step4';
                form.render();
                //s3.listenTo(form, 'hidden', _.bind(s3.close, s3));
                this.listenToOnce(form, 'save', _.bind(function(spill){
                    if (spill.get('substance').get('is_weatherable')){
                        this.step += 1;
                        this.next();
                        form.hide();
                    } else{
                        this.next();
                    }
                },this));
            },this));

            s5 = new WaterForm();

            var finishForm = new TextForm({
                title: 'Finished',
                body: "<div><p>Pressing the <b>Run Model</b> button will now take you to the <b>Map View</b> where you can visualize the spill movement.</p> <p>You can switch between Views by using the icons shown below which will appear at the top right of your browser window.<ul><li> To make modifications to your model setup, switch to <b>Setup View</b>.</li> <li> To view the oil budget, switch to <b>Fate View.</b></li></ul></p><p><img src='img/view_icons.png' alt='Image of View icons' style='width:473px;height:180px;'></p></div>",
                buttons: "<button type='button' class='cancel' data-dismiss='modal'>Cancel</button><button type='button' class='back'>Back</button><button type='button' class='finish' data-dismiss='modal'>Run Model</button>"
            });

            finishForm.on('finish', function() {
                webgnome.model.save().always(function() {
                    localStorage.setItem('view', 'trajectory');
                    localStorage.setItem('autorun', true); 
                    webgnome.router.navigate('trajectory', true);
                });
            });

            this.steps.push(finishForm);

            this.steps = [
                s1,
                s2,
                s3,
                s4,
                s5,
                finishForm
            ];

            this.start();
        }
    });

    return ofsWizard;
});