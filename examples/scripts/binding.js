/* CUSTOM BINDING */
html.activeSelected = function (section) {
	var elm = html.element();
	var update = function () {
		var current = section();
		html.query('li', elm).each(function(ele) { html(ele).removeClass('active'); });
		html('li.' + current, elm).addClass('active');
	};
	update();
	section.subscribe(update);
	return this;
};

/* BINDING DATA TO UI */
(function() {
	var preventClick = function (e) {
		html(this).$(); // go to parent - aka LI tag
		if (html.hasClass('disabled') || html.hasClass('active')) {
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
		};
	};
	
	var vm = html.module('viewModel');
	
	html('ul.nav').activeSelected(vm.section);
	html.query('ul.nav li a').each(function (el) {
		html(el).click(preventClick);
	});
	// bind data to show or hide section
	html('div.welcome').hidden(vm.isDataSectionDisplayed, true);
	html('div.content').visible(vm.isDataSectionDisplayed, true);
	
    html('ul.pagination').each(vm.totalPage, function(page, index) {
        if (index === 0) {
            // render "previous page" button
            html.li.a.attr({href: '#'+ vm.section() + '/' + vm.pageIndex()}).text('&laquo;').click(preventClick).$a;
            vm.pageIndex() === 0 && html.addClass('disabled');
        }
        
        html(this).li.a.text(index + 1).attr({href: '#' + vm.section() + '/' + (index + 1)}).click(preventClick).$a;
        if (index === vm.pageIndex()) html.addClass('active'); // add "active" class for LI tag if it's selected.
                               
        if (index === vm.totalPage() - 1) {
            // render "previous page" button
            html(this).li.a.text('&raquo;').attr({href: '#'+ vm.section() + '/' + (vm.pageIndex() + 2)}).click(preventClick).$a;
            // add class 'disabled' 
            vm.pageIndex() === vm.totalPage() - 1 && html.addClass('disabled');
        }
    });
    html('#search').input(vm.search); // binding data for search box
    html('.sort-name').click(vm.sort, 'name'); // binding sort by name button
    html('.sort-price').click(vm.sort, 'price'); // binding sort by price button
})();
/* END OF BINDING DATA */