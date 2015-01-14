;(function($, window, document, undefined) {
	"use strict";
	var ns = 'offcanvasmenu' 
		,methods = {
		/* public methods (name is usefull for debugging purposes, so do not use anonymous functions )
		 public_method_name : function public_method_name () {
		 	return this.each(function() {
		 		var o = _getInstanceOptions(this);
		 	});
		 }
		 */
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
			});

			// use extend(), so no o is used by value, not by reference
			$.data(this, ns, $.extend(true, o, {}));

			/* functional plugin code */
			_initSnap(o);

		});
	}

	function _initSnap(o){
		var snapper;
			
		o.snapSettings.element = o.$that.get(0); 		 
		 
		snapper = new Snap(o.snapSettings);
			
		snapper.on('close', function(){
			//check if the window should be scrolled to the bottom of the content div
			var windowHeight = $(window).height()
				,$lastChild = o.$that.find(' > *').last()
				,footerBottom = $lastChild.offset().top + $lastChild.outerHeight()
				,distance = footerBottom-windowHeight;
			
			if ($(window).scrollTop() > distance) {
				//user scrolled below the footer
				window.scrollTo(0,footerBottom-windowHeight);
			}
		  
		});
		
		$('html',document).on('click',function(event){
			//user clicked on spave below the content div, 
			//this only happens if the snapper menu is larger then the content, and the click occurs below the footer  
			//Note: iOS uses onclick on 'html', other devices on document 
			if (event.target.tagName == 'HTML') {
				snapper.close();
			}
		});
		
		o.btnToggleLeft.on('click',function(event){
			event.preventDefault();
			//toggle snapper
			if( snapper.state().state=="left" ){
		        snapper.close();
		    } else {
		        snapper.open('left');
		    }
		});
		
		o.btnToggleRight.on('click',function(event){
			event.preventDefault();
			//toggle snapper
			if( snapper.state().state=="right" ){
		        snapper.close();
		    } else {
		        snapper.open('right');
		    }
		});
	}

	/* mandatory check for all the dependencies to external libraries */
	function _allDependenciesAvailable() {

		var err = [];

		if (typeof Snap === 'undefined') err.push('Snap');

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

	/* private methods, names starting with a underscore
	 function _private_method_name(o){

	 }
	 */

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
		,btnToggleLeft : $('.snap-toggle-left')
		,btnToggleRight : $('.snap-toggle-right')
		//for all snap options see https://github.com/jakiestfu/Snap.js/	
		,snapSettings : { 		//snap setting "element" should not be declared in o.snapSettings, it is based on the element this plugin is initialized on
			disable: 'right'		//set to 'none', 'left' or 'right'
			,touchToDrag: false
		}
	};

})(jQuery, this, this.document); 