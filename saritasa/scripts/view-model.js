var Book = function(model) {
    this.id = model.id;
    this.name = model.name;
    this.picture = model.picture;
    this.price = model.price;
    this.desc = model.desc;
}

var ViewModel = function() {
    // save a reference for this here
    var self = this, filterResult;
    // view mode
    this.section = html.data();
    // declare an array for all books
    this.books = html.data([]);
    this.totalPage = html.data(0);
    this.pageIndex = html.data(0);
    this.pageSize = html.data(5);
    this.search = html.data('').delay(12);
    this.section.subscribe(function(section) {
        if(section === 'tiles') self.pageSize(8);
        if(section === 'list') self.pageSize(5);
        self.pageIndexChanged(null, vm.pageIndex());
    });
    this.search.subscribe(function(newVal, oldVal) {
        if (!newVal) {
            filterResult = null;
            self.pageIndex(0);
            loadJSON(renderer);
            return;
        }
        self.pageIndex(0);
        loadJSON().done(function(data) {
            filterResult = html.data(data).filter(newVal).getFilterResult();
            renderer(filterResult);
        });
    });
    
    var loadJSON = function (callback) {
        return html.getJSON('resources/price.json').done(callback);
    };
    var renderer = function(data) {
        self.totalPage(Math.ceil(data.length/self.pageSize()));
        var books = [];
        for (var i = self.pageIndex()*self.pageSize(), j = (self.pageIndex()+1)*self.pageSize(); i < j; i++) {
            data[i] && books.push(new Book(data[i]));
        }
        self.books(books);
        self.totalPage.refresh();
    };
    //loadJSON(renderer);
    
    /* EVENTS */
    
    // go to another page
    this.pageIndexChanged = function(e, index) {
        self.pageIndex(index);
        loadJSON(function(data) {
            renderer(filterResult || data);
        });
    };
    
    // sort
    this.sort = function(e, field) {
        loadJSON().done(function(data) {
            filterResult = html.data(filterResult || data).orderBy(field)();
            renderer(filterResult);
        });
    };
};
var vm = new ViewModel;