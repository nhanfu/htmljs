/* BINDING DATA TO UI */
(function(vm) {
    html('.books').each(vm.books, function(book, index) {
        if (vm.section() === 'list') {
            html(this).div().className('row bookItem')
                .div().className('col-xs-1 image').img().attr({'src': book.picture, width: '90px', height:"auto"}).$('img div div')
                .div().className('col-xs-9 desc').h2(book.name).$().p(book.desc).$('p div div')
                .div().className('col-xs-1 price pull-right').a().className('btn btn-sm btn-primary pull-right').i().className('fa fa-tag').$().space(4).span('$' + book.price)
        } else {
            var row;
            if (index === 0 || index !== 0 && index % (vm.pageSize()/2) === 0 && index !== vm.pageSize() - 1) {
                html.div().className('row');
            }
            html('.books > div:last-child').div().className('col-xs-3').div().className('tiles')
                .div().className('row').img().attr({'src': book.picture, width: 'auto', height:"120px"}).$('div')
                .div().className('row desc').text(book.desc.length > 200? book.desc.substr(0,200) + '....': book.desc).$('div')
        }
    });
    
    html('ul.pagination').each(vm.totalPage, function(page, index) {
        var li;
        if (index === 0) {
            li = html(this).li().a('&laquo;', '#'+ vm.section() + '/' + vm.pageIndex()).$('li');
            vm.pageIndex() === 0 && li.className('disabled')
        }
        
        li = html(this).li().a(index + 1, '#' + vm.section() + '/' + (index+1)).$('li');
        if (index === vm.pageIndex()) li.className('active');
                               
        if (index === vm.totalPage() - 1) {
            li = html(this).li().a('&raquo;', '#'+ vm.section() + '/' + (vm.pageIndex()+2)).$('li');
            vm.pageIndex() === vm.totalPage() - 1 && li.className('disabled')
        }
    });
    html('#search').input(vm.search);
    html('.sort-name').click(vm.sort, 'name');
    html('.sort-price').click(vm.sort, 'price');
})(vm);
/* END OF BINDING DATA */