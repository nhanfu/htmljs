(function() {
	var vm = html.module('viewModel'); // get the view model
	
    html.router('/htmljs/examples/index.html', function () {		
		// show welcome
        vm.isDataSectionDisplayed(false);
    });
    html.router('#:section', function (section) {
        if (section === '' || section === 'home') {
			// hide the content, show the welcome
			vm.isDataSectionDisplayed(false);
            return;
        }
		
		// hide welcome, show content
        vm.isDataSectionDisplayed(true);
		// set the page index if the section change
		// we has prevented user click on the same section
		// simply preventDefault the active section
		var isChange = vm.pageIndex() !== 0 || vm.section() === section;
        vm.pageIndex(0);
		// set the section, it will trigger a subscriber that load the page content again
        vm.section(section);
		if (isChange) vm.section.refresh();
    });
    html.router('#:section/:pageIndex', function (section, pageIndex) {
		// process for page index routing
		// save old section and old page index for later checking
		var oldSection = vm.section(),
			oldPageIndex = vm.pageIndex();
		// parse pageIndex in the URL, it's originally a string
		pageIndex = parseInt(pageIndex);
		// hide welcome section and show the content
        vm.isDataSectionDisplayed(true);
		
		// set new page index (if possible)
        vm.pageIndex(pageIndex - 1);
		// set new section (if possible)
        vm.section(section);
        if (section === oldSection && pageIndex - 1 !== oldPageIndex) {
			// refresh the page content if the section not change but the page index changed
			vm.section.refresh();
		}
    });
    $('ul.pagination, ul.nav').on('click', 'a', function (e) {
		var src = e.target || e.srcElement;
        var currLi = $(this).parent();
        if (currLi.hasClass('active') || currLi.hasClass('disabled')) {
			// not to push history nor process when user click on the same page index
			e.preventDefault();
		} else {
			// when user doesn't click on the same page, active the link
			currLi.parent().find('li').removeClass('active');
			currLi.addClass('active');
		}
    });
})();