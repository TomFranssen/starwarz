/******************************
*** Off canvas menu 
*******************************/
$(document).offcanvas();


/******************************
*** Tooltips 
*******************************/
$("span[data-toggle='tooltip']").tooltip({
	container : 'body',
	trigger : 'hover click'
});

//for mobile devices: hide tooltips when clicking on the body	
$('body').on('touchstart',function(e) {
	var $tooltip = $('.tooltip');
	$('span[data-toggle="tooltip"]').each(function() {
		var $that = $(this);
		if (!$that.is(e.target) && $that.has(e.target).length === 0 && $tooltip.has(e.target).length === 0) {
			$that.tooltip('hide');
		}
	});
});

//add validation to borh search forms
$('#frm-search').validate();
$('#frm-search-xs').validate();




/******************************
*** Search bar
*******************************/
//don't use the default Boostrap collapse plugin, since setting the focus on an input field onm iOS won't work.
//It must be initiated by a user click, event handling doesn't work
(function (){
	var $searchbar = $('#searchbar'),
		$keyword = $('input#keyword');

	$('.btn-toggle-search').on('click', function(event){
		event.preventDefault();
		//use the same classes as the Bootstrap collapse plugin
		$(this).toggleClass('collapsed');
		$searchbar.toggleClass('in');
		$keyword.focus();
	});

})();

/******************************
 *** panel group with collapsable panels
 *******************************/
(function (){
    $('[data-toggle="collapse"]').on('click', function () {
        var link = $(this),
            panelHeading = link.parents('.panel-heading');

        //add extra class on panel-heading
        if (link.hasClass('collapsed')) {
            panelHeading.addClass('collapsed');
        } else {
            panelHeading.removeClass('collapsed');
        }
    });
})();
