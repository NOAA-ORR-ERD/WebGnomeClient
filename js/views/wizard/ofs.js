define([
    'underscore',
    'moment',
    'sweetalert',
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
], function(_, moment, swal, BaseWizard, ModelForm, WaterForm, WindTypeForm, MapTypeForm, SpillTypeForm, TextForm, GoodsMoverForm, DiffusionForm,
        GnomeModel, WindModel){
    var ofsWizard = BaseWizard.extend({
        initialize: function(){
        },

        setup: function(){
            var s1, s2, s3, s4, s5, s6;
            s1 = new GoodsMoverForm({
                name: 'step2',
                size: 'xl',
                request_type: 'currents',
                buttons: '<button type="button" class="wizardclose">Cancel</button>',
                wizard: true,
            });
            this.listenTo(s1, 'wizardclose', _.bind(this.confirmClose, s1));
            s1.listenTo(s1, 'select', _.bind(function(form){
                    //Subset form
                    form.buttons = '<button type="button" class="wizardcancel">Cancel</button><button type="button" class="submit">Submit</button>';
                    form.name = 'step2';
                    form.$el.on('change #subset_start_time', _.bind(this.updateModelTime, this, form));
                    form.$el.on('change #subset_end_time', _.bind(this.updateModelTime, this, form));
                    s1.listenTo(form, 'wizardcancel', _.bind(function(){this.show();}, s1));
                    this.listenTo(form, 'success', _.bind(function(req){
                        form.on('hidden', _.bind(function(){
                            if (req.include_winds){
                                this.step += 1;
                                this.next();
                            } else{
                                this.next();
                            }
                        }, this));
                    },this));
                }, this)
            );
            // s2 = new ModelForm({
            //     name: 'step2',
            //     title: 'Model Settings <span class="sub-title">OFS Wizard</span>',
            //     buttons: '<button type="button" class="cancel">Cancel</button><button type="button" class="next">Next</button>',
            // }, webgnome.model);
            // s2.listenTo(s2, 'hidden', _.bind(s2.close, s2));
            s3 = new WindTypeForm({
                name: 'step3',
                title: 'Select Wind Type <span class="sub-title">OFS Wizard</span>',
                buttons: '<button type="button" class="wizardclose">Cancel</button>'
            });
            this.listenTo(s3, 'wizardclose', _.bind(this.confirmClose, s3));
            this.listenTo(s3, 'select', _.bind(function(form){
                //Can be upload, goods wind, or point wind
                //form in this case is the chosen wind type form (upload, point, goods)
                form.name = 'step3';
                form.buttons = '<button type="button" class="wizardcancel">Cancel</button><button type="button" class="save">Next</button>';
                s3.listenToOnce(form, 'prev', s3.show);
                s3.listenToOnce(form, 'cancel', s3.show, s3);
                s3.listenToOnce(form, 'wizardcancel', s3.show, s3);
                this.listenToOnce(form, 'save success', _.bind(function(){
                    form.close();
                    s3.close();
                    this.next();
                },this));
            },this));

            s4 = new SpillTypeForm({
                name: 'step4',
                title: 'Select Spill Type <span class="sub-title">GNOME Wizard</span>',
                buttons: '<button type="button" class="wizard-close">Cancel</button>'
            });
            this.listenTo(s4, 'wizardclose', _.bind(this.confirmClose, s4));
            this.listenTo(s4, 'select', _.bind(function(form){
                //Spill form
                form.title += '<span class="sub-title">OFS Wizard</span>';
                form.name = 'step4';
                form.buttons = '<button type="button" class="wizardcancel">Cancel</button><button type="button" class="save">Next</button>';
                s4.listenToOnce(form, 'cancel', s4.show);
                s4.listenToOnce(form, 'wizardcancel', s4.show, s4);
                this.listenToOnce(form, 'save success', _.bind(function(spill){
                    if (!spill.get('substance').get('is_weatherable')){
                        this.step += 1;
                        this.next();
                    } else{
                        this.next();
                    } 
                    form.close();
                },this));
                s4.listenToOnce(form, 'save', s4.close);
            },this));

            s5 = new WaterForm({
                name: 'step5',
                buttons: '<button type="button" class="wizardclose">Cancel</button><button type="button" class="save">Next</button>'
            });
            this.listenToOnce(s5, 'save', _.bind(function(model){
                webgnome.model.get('environment').add(s5.model, {merge: true});
                webgnome.model.save(null, {validate: false});
                s5.close();
            },this));

            s6 = new DiffusionForm({
                name: 'step6',
                buttons: '<button type="button" class="wizardclose">Cancel</button><button type="button" class="save">Next</button>'
            });
            this.listenToOnce(s6, 'save', _.bind(function(model){
                webgnome.model.get('movers').add(s6.model, {merge: true});
                webgnome.model.save(null, {validate: false});
                s6.close();
            },this));

            var finishForm = new TextForm({
                title: 'Finished',
                body: "<div><p>Pressing the <b>Finish</b> button will now take you to the <b>Setup View</b> where you can review the model and check the progress of the download for the Operational Forecast Model you selected. Once the download completes successfully, a mover based on that OFS is added to the model.</p><p>You can switch between Views by using the icons shown below which will appear at the top right of your browser window.<ul><li> To run your model setup, switch to <b>Map View</b>.</li> <li> To view the oil budget, switch to <b>Fate View.</b></li></ul></p><p><img src='img/view_icons.png' alt='Image of View icons' style='width:473px;height:180px;'></p></div>",
                buttons: "<button type='button' class='wizardclose' data-dismiss='modal'>Cancel</button><button type='button' class='finish' data-dismiss='modal'>Finish</button>"
            });

            finishForm.on('finish', function() {
                webgnome.model.save().always(_.bind(function() {
                    this.trigger('wizard_complete');
                },this));
            });


            this.steps = [
                s1,
                // s2,
                s3,
                s4,
                s5,
                s6,
                finishForm
            ];

            this.start();
        },

        confirmClose: function() {
            if (!this.nonmodelWizard) {
                swal.fire({
                        title: "Are you sure?",
                        text: "You will return to setup view with a partial Model",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, I am sure",
                        cancelButtonText: "Go back",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    }).then(_.bind(function(confirm) {
                        if (confirm.isConfirmed) {
                            this.terminateWizard();
                        } else {
                            this.steps[this.step].show();
                        }
                    }, this));
            } else {
                this.close();
            }
        },

        terminateWizard: function() {
            //This function cleans up all the steps of the wizard.
            _.each(this.steps, function(step){
                step.close();
            });
            this.steps = [];
            this.$el.remove();
            this.trigger('wizard_complete');
        },

        updateModelTime: function(form, ev) {
            //A special function for this wizard that updates the model start time and duration based on the inputs on the
            //subset form. Should only activate through the wizard
            var st = moment(form.$('#subset_start_time').val(), webgnome.config.date_format.moment);
            var et = moment(form.$('#subset_end_time').val(), webgnome.config.date_format.moment);
            if (st >= et.clone().subtract(1, 'hour')){
                et = st.clone().add(1, 'hour'); //must be at least 1 hour long
                form.$('#subset_end_time').val(et.format(webgnome.config.date_format.moment));
            }
            var duration = (et - st) / 1000;
            var st_f = st.format('YYYY-MM-DDTHH:mm:ss');
            if (webgnome.model.get('start_time') !== st_f || webgnome.model.get('duration') !== duration){
                webgnome.model.set({
                    start_time: st_f,
                    duration: duration,
                });
                webgnome.model.save();
            }
        }
    });

    return ofsWizard;
});