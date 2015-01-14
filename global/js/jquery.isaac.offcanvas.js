;(function($, window, document, undefined) {
	"use strict";
	var ns = 'offcanvas' 
		,methods = {
		};

	function _init(options) {

		if (!_allDependenciesAvailable()) {return false ;}

		var opts = $.extend(true, {}, $.fn[ns].defaults, options);

		return this.each(function() {

			var $that = $(this)
				,o = $.extend(true, {}, opts, $that.data(opts.datasetKey));

			// add data to the defaults (e.g. $node caches etc)
			o = $.extend(true, o, {
				$that : $that
				,state : 'closed'
				,$body : $('body')
				,$window : $(window)
			});

			// use extend(), so no o is used by value, not by reference
			$.data(this, ns, $.extend(true, o, {}));

			o.btnToggle.on('click',function(event){
				event.preventDefault();
				_toggle(o);
			});		
	
		});
	}

	/*
	 Toggle the offcanvas menu visibility
	 */
	function _toggle(o) {
		if (o.state === 'closed') {
			_resize(o);
			o.$body.removeClass('offcanvas-closing').addClass('offcanvas-open');
			o.state = 'open';
			setTimeout(function(){
				//add events after the animation is complete
				_addCustomEventHandlers(o);
			},o.animationDuration);
		} else {
			o.$body.removeClass('offcanvas-open').addClass('offcanvas-closing');
			
			_removeCustomEventHandlers(o);
			
			
			//remove all classes so the DOM is left pristine: no classes or styles remain after the offcanvas menu is closed. This prevents breaking other components
			//make sure the animationDuration matches the timing set in the offcanvas scss
			setTimeout(function(){
				o.$body.removeClass('offcanvas-closing');	
			},o.animationDuration);
			
			o.state = 'closed';
		}
	}

	function _addCustomEventHandlers(o) {
		//add event handlers with offcanvas namespace
		o.$window.on('resize.offcanvas',function(event){
			_resize(o);
		});
		
		o.content.on('click.offcanvas',function(event){
			_toggle(o);
		});
		
		$('html',document).on('click.offcanvas',function(event){
			//user clicked on spave below the content div, 
			//this only happens if the snapper menu is larger then the content, and the click occurs below the footer  
			//Note: iOS uses onclick on 'html', other devices on document 
			if (event.target.tagName == 'HTML') {
				_toggle(o);
			}
		});
			
	}

	function _removeCustomEventHandlers(o) {
		o.$window.off('.offcanvas');
		o.content.off('.offcanvas');
		$('html',document).off('.offcanvas');
	}

	/*
	 Resize the offcanvas height to make it full height
	*/
	function _resize(o){
		var contentHeight = o.content.outerHeight(true)
			,windowHeight = o.$window.height()
			,offcanvasHeight = windowHeight; 
		
		if (contentHeight > windowHeight) {
			//vertical scrollbar is shown, so use the contentHeight
			offcanvasHeight = contentHeight; 
		}
		
		//set the min-height for the offcanvas, so content in the offcanvas will force it to grow larger
		o.menu.css('min-height',offcanvasHeight + 'px');	
	}

	/* mandatory check for all the dependencies to external libraries */
	function _allDependenciesAvailable() {

		var err = [];

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
		,btnToggle : $('.offcanvas-toggle')
		,animationDuration : 200 			//duration for the CSS animation in ms, make sure it matches the values used in the css
		,menu : $('.offcanvas-menu') 		//jQuery wrapped set with the offcanvas menu  
		,content : $('.offcanvas-content')	//jQuery wrapped set with the content wrapper
	};

})(jQuery, this, this.document); 