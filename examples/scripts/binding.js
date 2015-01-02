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
	html('div.welcome').hidden(vm.isDataSectionDisplayed);
	html('div.content').visible(vm.isDataSectionDisplayed);
	
    // binding books View-Model to the View
    html('.books').each(vm.books, function(book, index) {
		var section = vm.section();
        if (section === 'list') {
            // for list view
            html(this).div().className('row bookItem')
                .div().className('col-xs-1 image').img().attr({'src': book.picture, width: '90px', height:"auto"}).$('img div div')
                .div().className('col-xs-9 desc').h2(book.name).$().p(book.desc).$('div div')
                .div().className('col-xs-1 price pull-right').a().className('btn btn-sm btn-primary pull-right').i().className('fa fa-tag').$().space(4).span('$' + book.price)
        } else if (section === 'tiles') {
            // for tiles view
            if (index === 0 || index !== 0 && index % (vm.pageSize()/2) === 0 && index !== vm.pageSize() - 1) {
                // add a row wrapper, each view has 2 rows
                html.div().className('row');
            }
            // render a book
            html('.books > div:last-child').div().className('col-xs-3').div().className('tiles')
                .div().className('row').img().attr({'src': book.picture, width: 'auto', height:"120px"}).$('div')
                .div().className('row desc').text(book.desc.length > 200? book.desc.substr(0,200) + '....': book.desc).$('div')
        }
    });
	
    html('ul.pagination').each(vm.totalPage, function(page, index) {
        if (index === 0) {
            // render "previous page" button
            html(this).li().a('&laquo;', '#'+ vm.section() + '/' + vm.pageIndex()).click(preventClick).$('li');
            vm.pageIndex() === 0 && html.addClass('disabled');
        }
        
        html(this).li().a(index + 1, '#' + vm.section() + '/' + (index+1)).click(preventClick).$('li');
        if (index === vm.pageIndex()) html.addClass('active'); // add "active" class for LI tag if it's selected.
                               
        if (index === vm.totalPage() - 1) {
            // render "previous page" button
            html(this).li().a('&raquo;', '#'+ vm.section() + '/' + (vm.pageIndex()+2)).click(preventClick).$('li');
            // add class 'disabled' 
            vm.pageIndex() === vm.totalPage() - 1 && html.addClass('disabled');
        }
    });
    html('#search').input(vm.search); // binding data for search box
    html('.sort-name').click(vm.sort, 'name'); // binding sort by name button
    html('.sort-price').click(vm.sort, 'price'); // binding sort by price button
})();
/* END OF BINDING DATA */