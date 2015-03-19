(function() {
	var vm = html.module('viewModel');
	vm.books.targets.length = 0;
	
	html('.books').each(vm.books, function(book, index) {
		if (index === 0 || index !== 0 && index % (vm.pageSize()/2) === 0 && index !== vm.pageSize() - 1) {
			// add a row wrapper, each view has 2 rows
			html.div().className('row');
		}
		// render a book
		html($('.books > div:last-child')[0]).div().className('col-xs-3').div().className('tiles')
			.div().className('row').img().attr({'src': book.picture, width: 'auto', height:"120px"}).$('div')
			.div().className('row desc').text(book.desc.length > 200? book.desc.substr(0,200) + '....': book.desc).$('div')
	});
})();