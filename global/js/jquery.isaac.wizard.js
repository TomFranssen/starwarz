//make sure the html 5 history plugin is included (https://github.com/devote/HTML5-History-API)

;(function($, window, document, undefined) {
    'use strict';
    var ns = 'wizard',
        methods = {
        };

    function _init(options) {

        if (!_allDependenciesAvailable()) {return false ;}

        var opts = $.extend(true, {}, $.fn[ns].defaults, options);

        return this.each(function() {

            var $that = $(this),
                o = $.extend(true, {}, opts, $that.data(opts.datasetKey));

            // add data to the defaults (e.g. $node caches etc)
            o = $.extend(true, o, {
                $that : $that
                ,viewModel:null
                ,$navContainer: $that.find(".nav")
                ,$steps: $that.find(".tab-pane")
                ,$window:$(window)
            });

            $.data(this, ns, $.extend(true, o, {}));

            /* functional plugin code */
            _initKo(o);
            _initHistoryState(o);
            _initEvents(o);
        });
    }

    function _initHistoryState(o){
        //set initial history state
        history.replaceState({stepIndex:0},null,"?step=" + _getStepIdByIndex(o,0));
    }

    function _initKo(o){
        o.viewModel =  ko.mapping.fromJS ({
            wizard : {
                stepCount : o.$steps.length,
                activeStepIndex : 0,
                previous : function() {
                    _previous(o);
                },
                next : function() {
                    _next(o);
                }
            }
        });

        //add computed observables
        o.viewModel.wizard.firstStep = ko.computed(function() {
            return (o.viewModel.wizard.activeStepIndex() === 0);
        }, this);

        o.viewModel.wizard.lastStep = ko.computed(function() {
            return (o.viewModel.wizard.activeStepIndex() === o.viewModel.wizard.stepCount()-1);
        }, this);

        ko.applyBindings(o.viewModel);

    }

    function _historyChange(o, state){
        var activeStepIndex = o.viewModel.wizard.activeStepIndex(),
            $activeStepForm = _getActiveStepForm(o),
            stepIndex = 0;


        //in IE8 the state might be null
        if (state) {
            stepIndex = state.stepIndex;
        }

        if (stepIndex < 0) {
            return;
        }

        if (stepIndex < activeStepIndex) {
            //go back
             _showStep(o, stepIndex, $activeStepForm);

        } else if (stepIndex > activeStepIndex){
            //step forward
            if (_validateActiveStep(o)) {
                _showStep(o, stepIndex, $activeStepForm);
            }


        }
    }

    function _showStep(o, stepIndex, $activeStepForm){
        _scrollTop(o,function(){
            o.viewModel.wizard.activeStepIndex(stepIndex);
            o.$navContainer.find('li:eq(' + stepIndex + ') span').tab('show');
            o.$navContainer.find('li:gt(' + stepIndex + ')').removeClass('completed');
            o.$navContainer.find('li:lt(' + stepIndex + ')').addClass('completed');

            if ($activeStepForm.length > 0) {
                _resetFormValidation(o, $activeStepForm)
            }
        });
    }

    function _resetFormValidation(o, $form){
        var validClass = $form.validate().settings.validClass
            ,errorClass = $form.validate().settings.errorClass
            ,validElement = $form.validate().settings.errorElement;

        $form.validate().resetForm(); //reset validator
        $form.find(validElement + "." + validClass + "," + validElement + "." + errorClass).remove(); //remove error labels
        $form.find(".form-group").removeClass(validClass).removeClass(errorClass); //reset classes
    }


    function _getActiveStepForm(o){
        var $activeStep = o.$steps.eq(o.viewModel.wizard.activeStepIndex());
        return $activeStep.find('form');
    }

    function _getStepIdByIndex(o, stepIndex){
        return o.$navContainer.find('li:eq(' + stepIndex + ') span').attr("data-target").replace("#","");
    }

    function _previous(o) {
        window.history.back();
    }


    function _next(o) {
        var activeStepIndex = o.viewModel.wizard.activeStepIndex(),
            $activeStepForm = _getActiveStepForm(o);

        if (_validateActiveStep(o)) {
            if (activeStepIndex < (o.viewModel.wizard.stepCount()-1)) {
                //save state to history
                history.pushState({stepIndex: (activeStepIndex+1)}, null, "?step=" + _getStepIdByIndex(o,activeStepIndex+1));
                _showStep(o, activeStepIndex+1, $activeStepForm);
            } else {
                //wizard has completed
                o.$that.trigger($.Event('completed.wizard'));
            }
        };
    }

    function _scrollTop(o, callback) {
        var done = false;

        if (o.scrollTop.enabled === false) {
            callback();
            return;
        }

        //checking if we need to scroll or not doesn't work. $(window).scrollTop() returns 0,
        //but the browser scrolls the page on a history.back();
        //So we need to make sure the page is always scrolled to the top.
        //Do not make the scrollTop.duration too large, because it introduces a delay if no scrolling is necessary!

        //slide the page to the top of the wizard, use body element for Chrome and iPad, html for others
        $('body,html').animate({scrollTop: (o.$that.offset().top - 20)}, o.scrollTop.duration, function(){
            if (!done) { //prevent callback from being called twice (for body and html)
                callback();
            }
            done = true;
        });

    }

    //validate the current step, returns true if the step was valid
    function _validateActiveStep(o){
        var $activeStepForm = _getActiveStepForm(o);

        if ($activeStepForm.length > 0) {
            if ($activeStepForm.validate(o.validate).form()) {
                return true;
            } else {
                _focusFirstError(o,$activeStepForm);
                return false;
            }
        } else {
            //no form was shown, so continue
            return true;
        }

    }

    function _focusFirstError(o,$form){
        var errorClass = $form.validate().settings.errorClass;
        if (o.focusFirstErrorField) {
            $form.find(".form-group."+errorClass+":first input").focus();
        }
    }

    function _initEvents(o){
        //disable links in wizard nav
        o.$navContainer.find('li a').click(function (e) {
            e.preventDefault();
        })

        //disable submit in step forms
        o.$steps.find('form').on('submit',function(event){
            event.preventDefault();
            _next(o);
        });

        //history state change
        o.$window.on('popstate', function(event) {

            // Chrome has a bug that it scrolls randomsly after a popstate.
            // To fix this we ignore only the first scroll event after a popstate
            var distance = $(document).scrollTop();
            o.$window.on('scroll', function() {
                $('body,html').scrollTop(distance);
                o.$window.off('scroll');
            });


            _historyChange(o, event.originalEvent.state);
        });
    }


    /* mandatory check for all the dependencies to external libraries */
    function _allDependenciesAvailable() {

        var err = [];



        if (typeof $.fn.tab === 'undefined') err.push('Bootstrap tab javascript');
        if (typeof $.fn.validate === 'undefined') err.push('validate');
        if (typeof window.ko === 'undefined') {
            err.push('knockoutJS');
        }  else {
            if (typeof window.ko.mapping === 'undefined') { err.push('knockoutJS mapping plugin'); }
        }

        if (err.length > 0) {
            alert(ns + ' jQuery plugin has missing lib(s): ' + err);
        }
        return err.length === 0;
    }

    /* retrieve the options for an instance for public methods*/
    function _getInstanceOptions(instance) {
        var o = $.data(instance, ns);
        if (!o) {
            console.error( 'jQuery.fn.' + ns + ': a public method is invoked before initializing the plugin. "o" will be undefined.');
        }

        return o;
    }

    $.fn[ns] = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if ( typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        } else {
            $.error( 'jQuery.fn.' + ns + '.' +  method + '() does not exist.');
        }
    };

    /* default values for this plugin */
    $.fn[ns].defaults = {
        datasetKey : ns.toLowerCase() //always lowercase
        ,validate : {} //validator options
        ,focusFirstErrorField: true	//focus on the first field in a step which has an error
        ,scrollTop : {
            enabled : true
            ,duration:250  //scroll to top animation in ms
        }
    };

})(jQuery, this, this.document);