define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/default/alert-danger.html',
    'views/base',
    'views/attributes/attributes'
], function($, _, Backbone, moment,
            AlertDangerTemplate, BaseView, AttributesView) {
    var formView = BaseView.extend({
        events: {
            'change input:not(.attributes input)': 'update',
            'change select:not(.attributes select)': 'update',
            'keyup input:not(.attributes select)': 'update',
        },

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
        },

        update: function(e) {
            if (!this.model) {
                return;
            }
            var name = this.$(e.currentTarget).attr('name');
            var value = this.$(e.currentTarget).val();

            if (!name) { return; }

            // if the user is inputting a negative numerical value
            // reset it back to the non-neg version.
            if ((value < 0 || value === '-') & !this.$(e.currentTarget).hasClass('neg_allow')) {
                var nonneg = value.replace('-', '');
                $(e.target).val(parseFloat(nonneg));

                value = nonneg;
            }

            if ($(e.target).attr('type') === 'number') {
                value = parseFloat(value);
            }

            if ($(e.target).attr('type') === 'checkbox') {
                value = e.target.checked;
            }

            var type = $(e.target).data('type');
            if (type) {
                if (type === 'array') {
                    value = value.split(',');
                }
            }

            if (value === 'null') {
                value = null;
            }

            if (_.isString(value) &&
                    value.match(/[\d\w]{8}-([\d\w]{4}-){3}[\d\w]{12}/) !== null) {
                if (_.has(webgnome.obj_ref, value)) {
                    value = webgnome.obj_ref[value];
                }
            }

            name = name.split(':');

            if(name.length === 1) {
                this.model.set(name[0], value);
            }
            else {
                this.model.get(name[0]).set(name[1], value);
            }
        },

        sync: function() {
            // supports second level nested models only
            // hopefully shouldn't need more than that
            if (_.isUndefined(this.model)) { return; }

            var names = _.keys(this.model.attributes);

            for (var name in names) {
                var field = this.$('[name="' + names[name] + '"]');

                if (field.length > 0) {
                    this.setInputVal(field, this.model.get(names[name]));
                }
                else {
                    var nested_model = this.model.get(names[name]);

                    if (nested_model) {
                        var nested_names = _.keys(nested_model.attributes);

                        for (var nested_name in nested_names) {
                            var nested_field = this.$('[name="' + names[name] + ':' + nested_names[nested_name] + '"]');

                            if (nested_field.length > 0) {
                                this.setInputVal(nested_field, this.model.get(names[name]).get(nested_names[nested_name]));
                            }
                        }
                    }
                }
            }
        },

        setInputVal: function(el, val) {
            if (el.is('input[type="text"]') &&
                    _.isString(val) &&
                    val.match(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/) !== null) {
                el.val(moment(val).format(webgnome.config.date_format.moment));
            }
            else if (el.is('input[type="radio"]')) {
                for (var r = 0; r < el.length; r++) {
                    if ($(el[r]).attr('value') === val) {
                        $(el[r]).attr('checked', true);
                    }
                }
            }
            else if (el.is('textarea') ||
                     el.is('input[type="number"]') ||
                     el.is('input[type="text"]')) {
                el.val(val);
            }
            else if (el.is('select')) {
                if (_.isObject(val)) {
                    el.val(val.id);
                }
                else if (_.isBoolean(val)) {
                    el.val(val.toString());
                }
                else {
                    el.val(val);
                }
            }
        },

        render: function() {
            BaseView.prototype.render.call(this);

            if (this.model) {
                this.sync();
                this.renderAttributes();
                this.stopListening(this.model, 'change', this.renderAttributes);
                this.listenTo(this.model, 'change', this.renderAttributes);
            }
        },

        renderAttributes: function() {
            if (this.attributes) {
                this.attributes.remove();
            }

            this.attributes = new AttributesView({name: this.model.get('obj_type'),
                                                  model: this.model});

            this.$el.append(this.attributes.$el);
        },

        error: function(strong, message) {
            this.clearError();
            this.$el.prepend(_.template(AlertDangerTemplate)({strong: strong, message: message}));
        },

        clearError: function() {
            this.$('.alert.validation').remove();
        },

        isValid: function() {
            if (_.isFunction(this.validate)) {
                var valid = this.validate();

                if (_.isUndefined(valid)) {
                    this.validationError = null;
                    return true;
                }

                this.validationError = valid;

                return false;
            }
            else {
                return true;
            }
        },

        validate: function() {
            if (!_.isUndefined(this.model)) {
                if (this.model.isValid()) {
                    return;
                }

                return this.model.validationError;
            }
        },

        close: function() {
            if (this.attributes) {
                this.attributes.close();
            }

            BaseView.prototype.close.call(this);
        }
    });

    return formView;
});
