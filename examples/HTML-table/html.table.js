var EngineEvent = function(e){
	this.originalEvent = e;
}

EngineEvent.prototype = {
	srcElement: null,
	target: null,
	value: null,
	oldValue: null,
    isDefaultPrevented: false,
	isPropagationStopped: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = true;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = true;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	}
}

var RenderingEvent = function(e, srcElement, value){
	this.originalEvent = e;
	this.srcElement = this.target = srcElement || null;
	this.value = value;
}
var RenderedEvent = function(e, srcElement, value){
	this.originalEvent = e;
	this.srcElement = this.target = srcElement || null;
	this.value = value;
}

RenderingEvent.prototype = EngineEvent.prototype;
RenderedEvent.prototype = EngineEvent.prototype;

//header: {field: 'FirstName', isDisplay: true, type: 'string', title: 'First name'}
html.tableControl = function(rows, headers){
	var headerRenderingHandler, 
        headerRenderedHandler, 
        rowRenderingHandler, 
        rowRenderedHandler, 
        headerRenderer, 
        rowRenderer;
	
	var container = this.element();
	var render = function(){
        var event, isDefaultPrevented = false, isPropagationStopped = false;
		var table = html(container).table().$$();
		var tHeader = html(table).thead().tr().$$();
        if(headerRenderingHandler){
            event = new RenderingEvent(null, this, {rows: rows, headers: headers});
            headerRenderingHandler.call(tHeader, event);
            if(event.isDefaultPrevented){
                isDefaultPrevented = true;
            }
        }
        
		if(!isDefaultPrevented){
			html(tHeader)
				.each(headers, headerRenderer || function(header, hIndex){
					html(this).th(header.display);
				}).$()
			.$();
		}
		
        if(headerRenderedHandler){
            event = new RenderingEvent(null, this, {rows: rows, headers: headers});
            headerRenderedHandler.call(tHeader, event);
        }
        
		html(table).tbody().each(rows, function(row, rowIndex){
            var tRow = html(this).tr().$$();
            var isDefaultPrevented = false, 
                isPropagationStopped = false,
                rowEvent;
            if(rowRenderingHandler){
                rowEvent = new RenderingEvent(null, tRow, {rows: rows, headers: headers});
                rowRenderingHandler.call(tRow, rowEvent);
                if(rowEvent.isDefaultPrevented){
                    isDefaultPrevented = true;
                }
            };
			
            if(!isDefaultPrevented){
                rowRenderer
                    ? rowRenderer.call(tRow, rows, headers)
                    : html(tRow)
                        .each(headers, function(header, hIndex){
                            if(!header.isDisplay) return;
                            var tData = html.getData(row[header.field]);
                            html(this).td(tData);						
                        }).$()
                    .$();
            }
        
			if(rowRenderedHandler){
				rowEvent = new RenderingEvent(null, tRow, {rows: rows, headers: headers});
                rowRenderedHandler.call(tRow, rowEvent);
			};
		});
	};
	
	
	return {
        headerRenderingEvent: function(handler){ headerRenderingHandler = handler },
        headerRenderedEvent: function(handler){ headerRenderedHandler = handler },
		rowRenderingEvent: function(handler){ rowRenderingHandler = handler },
		rowRenderedEvent: function(handler){ rowRenderedHandler = handler },
		headerRenderer: function(handler){ headerRenderer = handler },
		rowRenderer: function(handler){ rowRenderer = handler},
        render: render
	}
};

var RowData = function(name, city, dateOfBirth, status, recordDate){
    var self = this;
    this.Name = html.data(name);
    this.City = html.data(city);
    this.DateOfBirth = html.data(dateOfBirth);
    this.DateOfBirthFormatted = html.data(function(){
        return self.DateOfBirth().getFullYear() + '-' + self.DateOfBirth().getMonth() + '-' + self.DateOfBirth().getDate();
    });
    this.Status = html.data(status);
    this.RecordDate = html.data(recordDate);
    this.RecordDateFormatted = html.data(function(){
        return self.RecordDate().getFullYear() + '-' + self.RecordDate().getMonth() + '-' + self.RecordDate().getDate();
    });
    
};

var rows = html.data([
   new RowData('Agatha Baines', 'Berlin', new Date(1991,01,01), 'Passive', new Date(2014,07,07)),
   new RowData('Agatha Einstein', 'Delhi', new Date(2005,08,07), 'Active', new Date(2014,04,23)),
   new RowData('Agatha Baines', 'Berlin', new Date(1959,12,18), 'Active', new Date(2014,08,04)),
   new RowData('Agatha Fowler', 'Hai Phong', new Date(1959,12,18), 'Active', new Date(2014,08,04)),
   new RowData('Agatha Gump', 'Hanoi', new Date(1945,01,28), 'Active', new Date(2014,02,19)),
   new RowData('Agatha Poirot', 'Toulouse', new Date(1981,09,09), 'Active', new Date(2014,07,28)),
   new RowData('Agatha Quint', 'Manchester', new Date(1942,05,20), 'Active', new Date(2014,10,15)),
   new RowData('Agatha Starling', 'Melbourne', new Date(1939,05,06), 'Active', new Date(2014,11,04)),
   new RowData('Albert Fuller', 'Frankfurt', new Date(1950,07,05), 'Active', new Date(2014,05,20)),
   new RowData('Albert Lem', 'Buenos Aires', new Date(1977,11,26), 'Active', new Date(2014,08,13)),
   new RowData('Amin Radcliffe', 'Porto', new Date(1957,03,28), 'Active', new Date(2014,06,03)),
]);

var HeaderData = function(field, display, isDisplay, type, isSort, isAsc){
    this.field = field;
    this.display = display;
    this.isDisplay = isDisplay;
    this.type = type;
    this.isSort = isSort;
    this.isAsc = isAsc;
};

var headers = html.data([
    new HeaderData('Name', 'Name', true, 'string', false, false),
    new HeaderData('City', 'City', true, 'string', false, false),
    new HeaderData('DateOfBirthFormatted', 'Date of birth', true, 'date', false, false),
    new HeaderData('Status', 'Status', true, 'string', false, false),
    new HeaderData('RecordDateFormatted', 'Record Date', true, 'date', false, false),
]);

var table = html(document.body).tableControl(rows, headers);
table.headerRenderingEvent(function(e){
    debugger;
    html(this).th('asdasdasd').attr({colspan: 2});
});
//table.headerRenderedEvent(headerRenderered);
//
//table.columnRenderingEvent(columnRenderering);
//table.columnRenderedEvent(columnRenderered);

table.render();