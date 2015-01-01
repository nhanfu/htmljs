(function() {
	var vm = html.module('viewModel'); // get the view model
	
    html.router('#:section', function (section) {
		// do nothing if we can't find any differences with the previous route
		if (vm.section() === section && vm.pageIndex() === 0) return;
		vm.section(section);
        if (section === '' || section === 'home') {
            return;
        }
		
		// set the page index if the section change
		// we has prevented user click on the same section
		// simply preventDefault the active section
		var isChange = vm.pageIndex() !== 0;
        vm.pageIndex(0);
		if (isChange) vm.section.refresh();
    });
    html.router('#:section/:pageIndex', function (section, pageIndex) {
		// parse pageIndex in the URL, it's originally a string
		pageIndex = parseInt(pageIndex);
		// do nothing if we can't find any differences with the previous route
		if (vm.section() === section && vm.pageIndex() === pageIndex - 1) return;
		// process for page index routing
		// save old section and old page index for later checking
		var oldSection = vm.section(),
			oldPageIndex = vm.pageIndex();
		
		// set new page index (if possible)
        vm.pageIndex(pageIndex - 1);
		// set new section (if possible)
        vm.section(section);
        if (section === oldSection && pageIndex - 1 !== oldPageIndex) {
			// refresh the page content if the section not change but the page index changed
			vm.section.refresh();
		}
    });
	html.router.process();
})();