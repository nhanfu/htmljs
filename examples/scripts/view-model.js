(function () {
	// declare a book template
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
		this.section = html.observable('home');
		this.isDataSectionDisplayed = html.observable(function () {
			var section = self.section();
			// hiding the welcome div if the section is 'home'
			// show the content div and vice versus
			return section === 'home' || section === ''? false: true;
		});
		// declare an array for all books
		this.books = html.observableArray([]);
		this.totalPage = html.observable(0);
		this.pageIndex = html.observable(0);
		this.pageSize = html.observable(5);
		
		// must delay search input delay some milliseconds, just wait for user inputting
		this.search = html.observable('').delay(12);
		
		// subscribe a function for section change, load the content when it has been changed
		this.section.subscribe(function (section) {
			if(section === 'tiles') self.pageSize(8);
			if(section === 'list') self.pageSize(5);
			self.pageIndexChanged(null, vm.pageIndex());
		});
		
		// custom search algorithm
		// instead of search in client we can load the search result and render after that
		this.search.subscribe(function(newVal, oldVal) {
			if (!newVal) {
				filterResult = null;
				self.pageIndex(0);
				loadJSON(renderer);
				return;
			}
			self.pageIndex(0);
			loadJSON().done(function(data) {
				filterResult = html.observable(data).filter(newVal).getFilterResult();
				renderer(filterResult);
			});
		});
		
		// load JSON function, here we load all items
		// return a Promise
		var loadJSON = function (callback) {
			return html.getJSON('resources/price.json').done(callback);
		};
		var renderer = function(data) {
			// calculate total page
			self.totalPage(Math.ceil(data.length/self.pageSize()));
			var books = [];
			
			for (var i = self.pageIndex()*self.pageSize(), j = (self.pageIndex()+1)*self.pageSize(); i < j; i++) {
				// only get data of current page
				// push them into a list
				data[i] && books.push(new Book(data[i]));
			}
			// set all items of the current page to observer
			// observer will render them to view automatically
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
				filterResult = html.observable(filterResult || data).orderBy(field)();
				renderer(filterResult);
			});
		};
	};
	
	// initialize View Model
	var vm = new ViewModel;
	// expose the View Model to outside js
	html.module('viewModel', vm);
})();