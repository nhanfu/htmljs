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
	cancel: false,

	preventDefault: function() {
		debugger;
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
html.table = function(rows, headers, renderer){
	var headerRenderingHandlers = html.array([]);
	var headerRenderedHandlers = html.array([]);
	var columnRenderingHandlers = html.array([]);
	var columnRenderedHandlers = html.array([]);
	
	var headerRenderingEvent = function(handler){
		headerRenderingHandlers.push(handler);
	}
	var headerRenderedEvent = function(handler){
		headerRenderedHandlers.push(handler);
	}
	var columnRenderingEvent = function(handler){
		columnRenderingHandlers.push(handler);
	}
	var columnRenderedEvent = function(handler){
		columnRenderedHandlers.push(handler);
	}
	
	var container = this.element();
	var render = function(){
		var table = html(container).table().$$();
		var trHeader = html(table).thead().tr().$$();
		var e = [];
		for(var i = 0, j = headerRenderingHandlers.length; i < j; i++){
			var beforeRenderHeader = headerRenderingHandlers[i];
			var e[i] = new RenderingEvent(null, this, header);
			if (i > 0 && e[i-1].cancel ===  true){
				break;
			}
			beforeRenderHeader.call(trHeader, e);
		});
		if(!e[i] || e[i] && !e[i].cancel){
			html(trHeader)
				.each(headers, function(header, hIndex){
					html(this).th(headers.title);						
				}).$()
			.$();
		}
		for(var i = 0, j = headerRenderingHandlers.length; i < j; i++){
			var beforeRenderHeader = headerRenderingHandlers[i];
			var e[i] = new RenderingEvent(null, this, header);
			if (i > 0 && e[i-1].cancel ===  true){
				break;
			}
			beforeRenderHeader.call(trHeader, e);
		});
		
		html(table).tbody().each(headers, function(header, hIndex){
			var e = [];
			for(var i = 0, j = headerRenderingHandlers.length; i < j; i++){
				var beforeRenderHeader = headerRenderingHandlers[i];
				var e[i] = new RenderingEvent(null, this, header);
				if (i > 0 && e[i-1].cancel ===  true){
					break;
				}
				beforeRenderHeader.call(this, e);
			});
			if(e[i] && e[i].cancel === true) return;
			html(this).th(headers.title);
			
			for(var i = 0, j = headerRenderedHandlers.length; i < j; i++){
				var afterRenderHeader = headerRenderedHandlers[i];
				var e[i] = new RenderingEvent(null, this, header);
				if (i > 0 && e[i-1].cancel ===  true){
					break;
				}
				afterRenderHeader.call(this, e);
			});
		});
	};
	
	
	return {
		headerRenderingEvent: headerRenderingEvent,
		headerRenderedEvent, headerRenderedEvent,
		columnRenderingEvent: columnRenderingEvent,
		columnRenderedEvent: columnRenderedEvent,
		render: render
	}
};

var table = html('#tableId').table(model, renderer, header);
table.headerRenderingEvent(headerRenderering);
table.headerRenderedEvent(headerRenderered);

table.columnRenderingEvent(columnRenderering);
table.columnRenderedEvent(columnRenderered);

table.render();