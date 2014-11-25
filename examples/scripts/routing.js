(function() {
	var vm = html.module('viewModel'); // get the view model
	
    html.router('/htmljs/examples/', function() {
		// process the home page
		// de-active the all tabs (for active home section)
        $('ul.nav li').removeClass('active');
        $('ul.nav li.home').addClass('active');
		// show welcome
        $('div.welcome').show();
		// hide content
        $('div.content').hide();
    });
    html.router('#:section', function(section) {
		// hide welcome
        $('div.welcome').hide();
        if (section === '' || section === 'home') {
            $('ul.nav li').removeClass('active');
            $('ul.nav li.home').addClass('active');
            $('div.welcome').show();
            $('div.content').hide();
            return;
        }
		// if the section is not home section
		// de-active all sections (for active current section)
        $('ul.nav li').removeClass('active');
        $('ul.nav li.' + section).addClass('active');
		// show the main content
        $('div.welcome').hide();
        $('div.content').show();
		
		// set the page index if the section change
		// we has prevented user click on the same section
		// simply preventDefault the active section
        vm.pageIndex(0);
		// set the section, it will trigger a subscriber that load the page content again
        vm.section(section);
    });
    html.router('#:section/:pageIndex', function(section, pageIndex) {
		// process for page index routing
		// save old section and old page index for later checking
		var oldSection = vm.section(),
			oldPageIndex = vm.pageIndex();
		// parse pageIndex in the URL, it's originally a string
		pageIndex = parseInt(pageIndex);
		// hide welcome section and show the content
        $('div.welcome').hide();
        $('div.content').show();
		
		// set new page index (if possible)
        vm.pageIndex(pageIndex - 1);
		// set new section (if possible)
        vm.section(section);
        if (section === oldSection && pageIndex - 1 !== oldPageIndex) {
			// refresh the page content if the section not change but the page index changed
			vm.section.refresh();
		}
		// de-active all page index controls (for active the current)
        $('ul.pagination li').removeClass('active');
        $('ul.pagination li.' + pageIndex).addClass('active');
		// de-active all sections (for active the current)
        $('ul.nav li').removeClass('active');
        $('ul.nav li.' + section).addClass('active');
    });
    $('ul.pagination, ul.nav').on('click', 'a', function(e) {
		var src = e.target || e.srcElement;
        // not to push history nor process when user click on the same page index
        var currLi = $(this).parent();
        if (currLi.hasClass('active') || currLi.hasClass('disabled')) e.preventDefault();
		
    });
})();