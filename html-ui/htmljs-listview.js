;(function () {
    var px = 'px';
    // render cell in the table
    function cellBinding(header, data, width, index, colIndex, cellClick) {
        var isImage = header.Type && header.Type === 'image',
            isCheckBox = header.Type && header.Type === 'checkbox',
            isButton = header.Type && header.Type === 'button',
            isHeaderText = header.Type && header.Type === 'headertext';
        // render a div to contain data
        html.div.css({ width: (header.Width - 1) + px });
        // render button
        if (isButton) html.button;
        // render checkbox, a little bit different from button
        // because checkbox always needs data binding
        if (isCheckBox) {
            html.checkbox(data); // only render checkbox
        }
        if (isImage) html.img.attr({ src: data, width: (header.Width -5 ) + px, height: 'auto' });
        // format the text, usually Date type
        if (isHeaderText)
            data.format(function (text) {
                var lines = text.split('\n');
                lines[0] = '<span title="' + lines[0] + '" class="bold">' + lines[0] + '</span>';
                var firstLine = lines.splice(0,1);
                return firstLine + lines.join('\n');
            });
        // render text of the cell or text of the button
        if (!isImage && !isCheckBox)
            header.ButtonText && !header.ButtonImage && html.text(header.ButtonText) || html.text(data);
        // binding event to cell
        if (header.Action) {
            // binding event to the control, usually click event
            cellClick && cellClick(index, colIndex, data);
            // set button image
            if (header.ButtonImage) {
                html.img.attr('src', header.ButtonImage);
            }
        }
        // implicit set editable
        // because we don't want to disable if Editable is not set
        header.Editable === false && html.enable(false);
    }

    html.listView = function (list, headers, attrs, rowClick, cellClick) {
        var element = html.element();
        var senderId = element.id;
        // empty the table before rendering
        html.empty();
        var tbodyWidth = 0, tableHeight;
        // render table body
        var tbody = html(element).tbody.css({
            width: (tbodyWidth) + px
        }).element();
        // we want to save all group state in client
        // then we can show/hide the group appropriately
        var groupListSession = [];
        list.subscribe(function (listItems) {
            if (listItems.length === 0) {
                html(tbody).empty();
                selectedIndex = -1;
                return;
            }
            // clone the original array to render or sort or group
            var listToRender = listItems.slice(0);
            // pre-process data if grouping/sorting
            if (attrs && attrs.groupby) {
                listToRender = html.array(listToRender).orderBy(attrs.groupby, attrs.sortby);
                html(element).addClass('grouping-table');
            }

            var groupList = [], currentGroup;
            // render data
            html(tbody).each(listToRender, function (listItem) {
                // we use row index in the ViewModel
                var rowIndex = listItems.indexOf(listItem);
                // render aggegates row
                if (attrs && attrs.groupby) {
                    var hasRenderedGroupRow = groupList.map(function (x) { return x.group }).indexOf(listItem[attrs.groupby]);
                    if (hasRenderedGroupRow < 0) {
                        currentGroup = { group: listItem[attrs.groupby], show: html.data(true) };
                        groupList.push(currentGroup);
                        // find the state of the group
                        var state = groupListSession.find(function (x) { return x.group === currentGroup.group });
                        // set the state of the current group if available
                        if (state) state.show && currentGroup.show(state.show());
                            // otherwise add to session
                        else groupListSession.push(currentGroup);
                        var text = attrs.grouptext.replace(/\{(\w+)\}/g, function (match, field) {
                            return listItem[field];
                        });
                        var totalWidth = headers.reduce(function (res, item) { return res + item.Width; }, 0);
                        html
                            .tr.expando('group', currentGroup).className('grouping-row')
                                .td.css('minWidth', totalWidth + px).attr('colspan', headers.length)
                                    .div.className('grouping-row-icon').$ // end of first DIV contains icon up down
                                    .div.text(text).$ // // end of second DIV contains grouping text
                                .$td; // end of TD element
                        // add class up or down depending on current group is shown or hidden
                        currentGroup.show() ? html.addClass('up') : html.addClass('down');
                        html.$tr;
                    }
                }
                // render table row
                html.tr.className(selectedIndex === rowIndex ? 'selected' : '').expando('row-index', rowIndex)
                    .each(headers, function (header, headerIndex) {
                        var headerWidth = header.Width;
                        if (headerIndex === headers.length - 1) headerWidth += 2;
                        // set css to each table cell
                        // remember to set width because we'll need this when dragging a row
                        html.td.css({
                            width: headerWidth + px,
                            Color: ((header.TextColor !== '') ? (header.TextColor) : (rowForeColor))
                        });
                        if (header.TextAlignString) {
                            var alignText = header.TextAlignString.toLowerCase();
                            if (alignText  === 'left') html.className('align-left');
                            if (alignText === 'right') html.className('align-right');
                            if (alignText === 'center') html.className('align-center');
                        }
                        header.Type && html.className(header.Type + ' col-' + headerIndex);
                        if (!header.Render) {
                            // convert data cell into observer
                            listItem[header.Data] = html.data(listItem[header.Data]);
                            // render data of each cell
                            // it could be text, button, checbox (editble or none editable)
                            cellBinding(header, listItem[header.Data], headerWidth, rowIndex, headerIndex, cellClick);
                        } else {
                            header.Render(header, listItem[header.Data], rowIndex, headerIndex);
                        }
                    });
                // hide all collapse rows
                if (currentGroup) html.visible(currentGroup.show, true);
            });
            // clear group that doesn't exists
            for (var i = 0, j = groupListSession.length; i < j; i++) {
                var g = groupListSession[i];
                var state = groupList.find(function (x) { return x.group === g.group; });
                if (!state) {
                    groupListSession.splice(i, 1);
                    i--; j--;
                }
            }
        });
        list.refresh();
        var divHeader = html.createEleNoParent('div').className('listViewHeader')
            .css({ width: ($(element).width() - 2) + px, backgroundColor: headerBackColor, whiteSpace: 'pre', overflow: 'hidden' })
            .element();
        html.table.tbody.tr.each(headers, function (header, index) {
            var headerWidth = header.Width;
            html.td.text(header.Caption).css({
                width: headerWidth + px, height: 'inherit', textAlign: header.HeaderAlignString, color: headerForeColor,
                overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block'
            });
        });

        // insert a fake item to get header height
        var headerHeight = 26;
        // set header height
        $(divHeader).find('tr').height(headerHeight);
        // create a wrapper for the table
        var divWrapper = $('<div>').addClass('listViewWrapper').addClass(element.className).css({
            position: 'absolute',
            left: $(element).css('left'),
            top: $(element).css('top'),
            width: $(element).width(),
            height: $(element).height()
        });
        var lastPos = 0;
        // append header to wrapper, create body wrapper
        var divBody = $('<div>').addClass('listViewBody')
            .css({
                width: ($(element).width() - 2) + px,
                height: (parseInt($(element).height()) - headerHeight - 4) + px,
                whiteSpace: 'pre', overflow: 'auto'
            }).scroll(function () {
                var currPos = $(this).scrollLeft();
                if (lastPos === currPos) return;
                $(divHeader).scrollLeft(currPos);
                lastPos = currPos;
            });
        tableHeight = $(divBody).height();
        divWrapper.appendTo(element.parentElement).append(divHeader).append(divBody.append(element));
        $(element).css({ position: '', top: '', left: '', height: 'auto', overflow: '', width: 'auto', maxHeight: '', backgroundColor: ''});

        var selectedIndex;
        // set selected row on click
        $(divBody).click(function (e) {
            var src = e.srcElement || e.target;
            if (src !== this) return;
            // if user click on the space where contains no rows
            // remove all selected index
            $(this).find('tr').removeClass("selected");
            // send selected index to the server with the index is -1
            rowClick && rowClick(-1);
            selectedIndex = -1;
        });
        $(element).on('click', 'tbody tr', function (e) {
            var src = e.srcElement || e.target;
            // not to send row click event
            // only send cell click event
            if (['button', 'input', 'label'].indexOf(src.nodeName.toLowerCase()) >=0) return;
            // don't add 'selected' class on click input, button, etc
            $(this).parent().children().removeClass("selected");
            if (this.children.length === 1 && $(this).hasClass('grouping-row')) {
                var currentGroup = html(this).expando('group');
                currentGroup.show(!currentGroup.show());
                var state = groupListSession.find(function (x) { return x.group === currentGroup.group; });
                state.show(currentGroup.show());
                currentGroup.show() ? $(this).removeClass('down').addClass('up') : $(this).removeClass('up').addClass('down');
            } else {
                $(this).addClass("selected");
                var index = html(this).expando('row-index');
                // send selected index to the server
                rowClick && rowClick(index);
                selectedIndex = index;
            }
        }).keydown(function (e) {
            var keyCode = e.which || e.keyCode;
            // do nothing if user don't press arrow up down
            if ([38, 40].indexOf(keyCode) < 0) return;
            // press arrow up, move the selected item up
            if (keyCode === 38 && selectedIndex > 0) selectedIndex--;
            // press arrow down, move the selected item down
            if (keyCode === 40 && selectedIndex < list().length - 1) selectedIndex++;
            $(this).find('tr').eq(selectedIndex).click();
        });
        return html;
    }
})();