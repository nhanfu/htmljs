(function() {
	var vm = html['import']('viewModel');
    html.router('', function() {
        $('ul.nav li').removeClass('active');
        $('ul.nav li.home').addClass('active');
        $('div.welcome').show();
        $('div.content').hide();
    });
    html.router('#:section', function(section) {
        $('div.welcome').hide();
        if(section === '' || section === 'home') {
            $('ul.nav li').removeClass('active');
            $('ul.nav li.home').addClass('active');
            $('div.welcome').show();
            $('div.content').hide();
            return;
        }
        $('ul.nav li').removeClass('active');
        $('ul.nav li.' + section).addClass('active');
        $('div.welcome').hide();
        $('div.content').show();
        vm.pageIndex(0);
        vm.section(section);
        $('ul.nav li.' + section).addClass('active');
        if(section === vm.section()) vm.section.refresh();
    });
    html.router('#:section/:pageIndex', function(section, pageIndex) {
        $('div.welcome').hide();
        vm.pageIndex(parseInt(pageIndex-1));
        vm.section(section);
        if(section !== vm.section() || pageIndex !== vm.pageIndex()) vm.section.refresh();
        $('ul.pagination li').removeClass('active');
        $('ul.pagination li.' + pageIndex).addClass('active');
        $('ul.nav li').removeClass('active');
        $('ul.nav li.' + section).addClass('active');
    });
    $('ul.pagination, ul.nav').on('click', 'a', function(e) {
        // not to push history nor process when user click on the same page index
        var currLi = $(this).parent();
        if(currLi.hasClass('active') || currLi.hasClass('disabled')) e.preventDefault();
    });
})();