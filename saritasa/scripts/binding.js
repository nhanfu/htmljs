/* BINDING DATA TO UI */
(function(vm) {
    html('.books').each(vm.books, function(book, index) {
        if(vm.section() === 'list') {
            html.div().className('row bookItem')
            .div().className('col-xs-1 image').img().attr({'src': book.picture, width: '90px', height:"auto"}).$().$()
            .div().className('col-xs-9 desc').h2(book.name).$().p(book.desc).$().$()
            .div().className('col-xs-1 price pull-right').a().className('btn btn-sm btn-primary pull-right').i().className('fa fa-tag').$().space(4).span('$' + book.price).$().$().$()
            .$();
        } else {
            if (index === 0) {
                html.div().className('row');
            }
            if (index && index % (vm.pageSize()/2) === 0 && index !== vm.pageSize() - 1) {
                html.div().className('row');
            }
            html('.books > div:last-child').div().className('col-xs-3').div().className('tiles')
                .div().className('row')
                    .img().attr({'src': book.picture, width: 'auto', height:"120px"}).$()
                .$()
                .div().className('row desc').text(book.desc).$()
            .$().$();
        }
    });
    
    html('ul.pagination').each(vm.totalPage, function(page, index) {
        if (index === 0) {
            html.li().a('&laquo;', '#'+ vm.section() + '/' + vm.pageIndex()).$().$();
        }
        
        html.li().a(index + 1, '#' + vm.section() + '/' + (index+1)).click(vm.pageIndexChanged, index);
        if (index === vm.pageIndex()) html.$().className('active').$();
        else html.$().$();
                               
        if (index === vm.totalPage() - 1) {
            html.li().a('&raquo;', '#'+ vm.section() + '/' + (vm.pageIndex()+2)).$().$();
        }
    });
    html('#search').input(vm.search);
    html('.sort-name').click(vm.sort, 'name');
    html('.sort-price').click(vm.sort, 'price');
})(vm);
/* END OF BINDING DATA */