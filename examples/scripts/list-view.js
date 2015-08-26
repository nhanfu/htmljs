(function() {
	var vm = html.module('viewModel');
	vm.books.targets.length = 0;
	
	html('.books').each(vm.books, function(book, index) {
		// for list view
		html(this).div.className('row bookItem')
			.div.className('col-xs-1 image')
				.img.attr({'src': book.picture, width: '90px', height:"auto"})
			.$div
			.div.className('col-xs-9 desc')
				.h2.text(book.name).$h2
				.p.text(book.desc).$p
			.div.className('col-xs-1 price pull-right')
				.a.className('btn btn-sm btn-primary pull-right')
					.i.className('fa fa-tag').$
					.span.text('&bnsp;&bnsp;&bnsp;&bnsp;')
					.span.text('$' + book.price)
	})
})();