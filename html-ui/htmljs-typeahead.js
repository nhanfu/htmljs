;(function () {
    var selectKey = [9, 38, 40, 13];
    // singleton container for search entry
    var ul = html.createEleNoParent('ul').className('search-result').element();
    html(function () {
        // append ul to the page after it's ready
        document.body.appendChild(ul);
    });

    // typeahead control
    html.typeahead = function (observer, searchResult) {
        var input = html.context;
        var isDisplay = html.observable(false);
        // render search result
        html(ul).each(searchResult, function (res, index) {
            // render LI tag
            html.li.text(res.Text);
            // set default selected index to be 0
            if (index === 0) html.className('active');
        }).visible(isDisplay, true);
        var selectedIndex = html.observable(0);
        function itemSelected(item) {
            // hide the list
            isDisplay(false);
            // empty search list
            searchResult([]);
            if (item == null) return;
            // set data for observer sliently
            observer._newData = item.Index;
            // set the text to the input
            // support for Patient Search Control
            if (input.attributes["PatientID"] != null) {
                input.value = item.Index.substring(item.Index.indexOf('.') + 1, item.Index.length);//item.Text;
            } else {
                input.value = item.SelectText;//item.Text;
            }
        }

        // event to handle press arrow up down and enter key
        html(input).keydown(function (e) {
            var keyCode = e.which || e.keyCode;
            // prevent default action if the key pressed is in our expected keys
            if (selectKey.indexOf(keyCode) < 0) return;
            // do nothing if the list is not displayed
            if (!isDisplay()) return;
            // press arrow up, move the selected item up
            if (keyCode === 38 && selectedIndex() > 0) selectedIndex(selectedIndex() - 1);
            // press arrow down, move the selected item down
            if (keyCode === 40 && selectedIndex() < searchResult().length - 1) selectedIndex(selectedIndex() + 1);
            // select data after pressing enter or tab key, select the item
            if ((keyCode === 13 || keyCode === 9) && searchResult().length > 0) itemSelected(searchResult()[selectedIndex()]);
        });
        // set active class for LI tag that is user navigate to
        selectedIndex.subscribe(function (index) {
            $(ul).find('li').removeClass('active');
            $(ul.children[index]).addClass('active');
        });

        var originOffset;
        searchResult.subscribe(function (list) {
            isDisplay(list.length > 0);
            selectedIndex(0);
            if (list.length === 0) return;
            // append the ul below of the input
            var offset = html(input).offset();
            if (originOffset && originOffset.left === offset.left && originOffset.top === offset.top) return;
            var height = parseInt(html(input).css('height'));
            var width = html(input).css('width');
            var top = html.isIE() ? (offset.top + 5) : offset.top
            html(ul).css({
                top: (top + height) + 'px',
                left: offset.left + 'px',
                position: 'absolute',
                minWidth: width,
                zIndex: 1999
            });
        });

        $(ul).on('mouseenter', 'li', function () {
            for (var i = 0, len = ul.children.length; i < len; i++) {
                if (ul.children[i] === this) {
                    selectedIndex(i);
                    return;
                }
            }
        }).on('click', 'li', function () {
            itemSelected(searchResult()[selectedIndex()]);
        });
    };
})();