define([
    'jquery',
    'underscore',
    'module',
    'moment',
    'text!templates/default/collapse-container.html',
    'views/modal/form',
    'views/modal/progressmodal',
    'views/form/outputter/kmz',
    'views/form/outputter/netcdf',
    'views/form/outputter/shape',
    'views/form/outputter/binary',
    'jqueryDatetimepicker'
], function($, _, module, moment, CollapseTemplate, FormModal, ProgressModal,
            KMZView, NetCDFView, ShapeView, BinaryView) {
    'use strict';
    var outputForm = FormModal.extend({
        className: 'modal form-modal export-form',

        title: "Configure Output",
        buttons: '<button type="button" class="cancel" data-dismiss="modal">Cancel</button><button type="button" class="save">Continue</button>',

        events: function() {
            return _.defaults({
                'click .collapse-form-header': 'toggleOutput',
                'change .collapse-form-header > input': 'forceCheckbox',
                'click .cancel': 'close'
            }, FormModal.prototype.events);
        },

        initialize: function(options, model) {
            this.module = module;
            FormModal.prototype.initialize.call(this, options);
            this.subForms = {};
            this.subFormIDs = [];
            this.applyContextualizedLockouts();
        },

        applyContextualizedLockouts: function() {
            //Because this sets up a special model run through the common cache, it interferes with trajectory and fate views
            //this function applies the appropriate pre-run changes to the underlying parent page to get this to run smoothly.
            //The 'liftContextualizedLockouts' function here and in modal/progressModal should undo the effects.
            var views = webgnome.router.views;
            for (var i = 0; i < views.length; i++) {
                if (views[i].module && views[i].module.id) {
                    if (views[i].module.id === 'views/model/fate/fate') {
                        webgnome.cache.rewind(true);
                        views[i].autorun(false);
                        views[i].stopListening(webgnome.cache, 'step:received');
                    } else {
                        webgnome.cache.rewind(true);
                    }
                }
                
            }
        },

        liftContextualLockouts: function() {
            var views = webgnome.router.views;
            for (var i = 0; i < views.length; i++) {
                if (views[i].module && views[i].module.id) {
                    if (views[i].module.id === 'views/model/fate/fate') {
                        views[i].autorun(true);
                    }
                }
            }
        },

        render: function(options) {
            var html = $('<form></form>',{ 'class': 'form-horizontal obj-inspect', 'role': 'form'});

            var outputViews = [NetCDFView, ShapeView, KMZView, BinaryView];
            var form, ext, fId, header, formContainer;
            for (var i = 0; i < outputViews.length; i++) {
                form = new outputViews[i]();
                ext = form.model.get('filename').split('.').pop();
                fId = form.title.split(" ")[0].toLowerCase();
                form.model.set('filename', webgnome.filenameSanitizeString(webgnome.model.get('name')) + '_' + fId + '.' + ext);
                header = '<label class="'+ fId + '-on checkbox-inline"><input type="checkbox" name="active"> ' + form.title + '</input></label>';
                formContainer = $(_.template(CollapseTemplate)({
                    formId: fId,
                    headerHtml: header
                }));
                $('.panel-body', formContainer).append(form.$el);
                this.subForms[fId] = form;
                this.subFormIDs = fId;
                html.append(formContainer);
            }

            this.body = html;

            FormModal.prototype.render.call(this, options);
        },
        
        update: function() {
            return;
        },


        toggleOutput: function(e) {
            var checkbox = $('input', $(e.currentTarget))[0];
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
                e.stopImmediatePropagation();
                $(e.currentTarget.getAttribute('href')).collapse('toggle');
            }
            var fId = $('label', $(e.currentTarget))[0].classList[0].split('-')[0];
            var model = this.subForms[fId].model;

            if (model.get('on') && !checkbox.checked) {
                model.set('on', false);
            } else if (!model.get('on') && !checkbox.checked) {
                var exp = e.currentTarget.getAttribute('aria-expanded');
                if (!exp || exp === "false") {
                    checkbox.checked = true;
                    model.set('on', true);
                }
            } else {
                checkbox.checked = true;
                model.set('on', true);
            }
        },

        contextualizeTime: function() {
            var timeInfo = this.model.timeConversion();

            this.$('#time_step').val(timeInfo.amount);
            this.$('#units').val(timeInfo.unit);
        },

        convertToSeconds: function(duration, unit) {
            switch (unit){
                case "s":
                    break;
                case "min":
                    duration *= 60;
                    break;
                case "hr":
                    duration *= 3600;
                    break;
            }

            return duration;
        },

        constructJSONPayload: function() {
            var payload = {};
            payload.model_name = webgnome.filenameSanitizeString(webgnome.model.get('name'));
            payload.outputters = {};
            var keys = _.keys(this.subForms);
            var model;
            for (var i = 0; i < keys.length; i++) {
                model = this.subForms[keys[i]].model;
                if (model.get('on')) {
                    payload.outputters[keys[i]] = model.toJSON();
                }
            }
            console.log(payload);
            return payload;
        },

        save: function(e) {
            if (!_.some(_.map(_.values(this.subForms), function(k) {return k.model.get('on');}))) {
                e.stopImmediatePropagation();
                this.error('Please select an exporter to continue');
                return;
            } else {
                this.clearError();
            }
            var payload = this.constructJSONPayload();
            this.progressModal = new ProgressModal({
                title: "Running Model...",
            }, payload);

            this.listenTo(this.progressModal, 'ready', _.bind(function(){
                this.hide();
            }, this));
            this.listenTo(this.progressModal, 'close', _.bind(this.close, this));
            this.progressModal.render();
        },

        close: function() {
            $('.xdsoft_datetimepicker').remove();
            var keys = _.keys(this.subForms);
            for (var i = 0; i < keys.length; i++) {
                this.subForms[keys[i]].close();
            }
            FormModal.prototype.close.call(this);
        }

    });

    return outputForm;
});
