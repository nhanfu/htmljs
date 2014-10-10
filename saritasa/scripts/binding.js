/* BINDING DATA TO UI */
(function(vm) {
    // binding books View-Model to the View
    html('.books').each(vm.books, function(book, index) {
        if (vm.section() === 'list') {
            // for list view
            html(this).div().className('row bookItem')
                .div().className('col-xs-1 image').img().attr({'src': book.picture, width: '90px', height:"auto"}).$('img div div')
                .div().className('col-xs-9 desc').h2(book.name).$().p(book.desc).$('div div')
                .div().className('col-xs-1 price pull-right').a().className('btn btn-sm btn-primary pull-right').i().className('fa fa-tag').$().space(4).span('$' + book.price)
        } else {
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
            // render "previous page" button «
            html(this).li().a('&laquo;', '#'+ vm.section() + '/' + vm.pageIndex()).$('li');
            vm.pageIndex() === 0 && html.className('disabled');
        }
        
        html(this).li().a(index + 1, '#' + vm.section() + '/' + (index+1)).$('li');
        if (index === vm.pageIndex()) html.className('active'); // add "active" class for LI tag if it's selected.
                               
        if (index === vm.totalPage() - 1) {
            // render "previous page" button »
            html(this).li().a('&raquo;', '#'+ vm.section() + '/' + (vm.pageIndex()+2)).$('li');
            // add class 'disabled' 
            vm.pageIndex() === vm.totalPage() - 1 && html.className('disabled');
        }
    });
    html('#search').input(vm.search); // binding data for search box
    html('.sort-name').click(vm.sort, 'name'); // binding sort by name button
    html('.sort-price').click(vm.sort, 'price'); // binding sort by price button
})(vm);
/* END OF BINDING DATA */