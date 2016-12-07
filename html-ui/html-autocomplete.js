;(function (html, $, KeyEvent) {
	'use strict';

	var px = 'px',
		className = {
			active: 'active',
			autocompplete: 'dropdown-autocomplete'
		},
		noDisplay = 'none';

	/**
     * Append the search result right under the input
     * @param {Element} ul The list items container
     * @param {Element} input The input to search dropdown list
     */
     function appendToInput(ul, input) {
        // Append to document body.
        // Never append to document before this method,
        // to avoid memory leak
        document.body.appendChild(ul);

        // Get the position of the input
        var pos = $(input).offset();

        // Set the position right under the input
        $(ul).css({
            position: 'absolute',
        	top: pos.top + $(input).height() + 6 + px,
        	left: pos.left + px
        });
        var inputWidth = parseInt(html(input).css('width'));
        $(ul).css({
        	minWidth: inputWidth + px,
        	maxWidth: inputWidth * 1.5 + px
        });
    }

	/**
	 * Dropdown list, using select 2 plugin
	 * @param {html.observable | html.observableArray | Array} dataSource - Dropdown list data source.
	 * Datasource could be remote data represents by an url string,
	 * or local data represents by an array
	 * @param {html.observable} selectedValue - Selected value
	 * @param {html.observable} [valueField = 'value'] - Value field property
	 * @param {html.observable} [textField = 'text'] - Text field property
	 */
	 html.autocompplete = function (dataSource, selectedValue, valueField, textField) {
		// Return a new instanceof dropdown
		if (!(this instanceof html.autocompplete)) {
			return new html.autocompplete(dataSource, selectedValue, valueField, textField);
		}

		if (dataSource == null && !(dataSource instanceof html.observable) && !(dataSource instanceof Array)) {
			throw 'Expect dataSource to be an observable data or an array.';
		}

		var self = this,
            realList = html.observableArray([]),
            input = $(html.context).find('input')[0],
            selectedValue = html.observable(selectedValue),
            parent = input.parentElement,
            style = html.attr('style'),
            placeholder = html.attr('placeholder'),
            text = null,
            hasClickedOnce = false;

		// If dataSource be an observableArray,
		if (dataSource instanceof html.observableArray) {
			// Set underlying data to realList
			realList.data = dataSource.data;
		} else if (dataSource instanceof html.observable) {
			// Subscribe dataSource change,
			// to update realList
			dataSource.subscribe(function (url) {
                // Query remote data source
				self.queryDataSource(url).done(function (list) {
                    // After querying data,
                    // set underlying data source
                    realList.data = list;

                    // set input text again
                    self.input.value = self.getSelectedText();
                });
			}).notify();
		} else if (dataSource instanceof Array){
			realList.data = dataSource;
		}

        self.input = input;
        // public dataSource property for client code to call.
        // Don't confuse with dataSource parameter in constructor,
        // this public property is an array
		self.dataSource = realList;
		self.repository = [];
		self.searchResult = html.unwrapData(realList);
		self.selectedValue = selectedValue;
		self.valueField = valueField || 'value',
		self.textField = textField || 'text';

        // Render container for dropdown
        self.ul = html(document.body).ul
        .css({ display: noDisplay })
        .attr({tabindex: 1000})
        .className('dropdown-result').context;
        self.$ul = $(self.ul);

        // Set value for input
        input.value = self.getSelectedText();

        // Register change event of the input,
        // Filter the dropdown list based on what user inputs
        html(input).onInput(function () {
        	var term = this.value;

            // Search the repository with search term
            self.searchResult = self.search(term);

            // Render the result
            html(self.ul).empty();
            self.renderSearchResult(self.searchResult);

            // Append the search result right under the input
            appendToInput(self.ul, self.input);

            // Show the search result
            if (self.ul.style.display === noDisplay) {
            	self.$ul.show();
            }
        });

        // Register blur event
        html.onBlur(function () {
            // Do nothing if user focus on the dropdown button
            if ($(this).next().is(':focus')) {
            	return;
            }

            // Set the flag hasClickedOnce be false,
            // to make sure that we will render the list again on click dropdown button
            hasClickedOnce = false;

            // Forward to blurEventHanlder
            if (self.ul.style.display !== noDisplay) {
            	self.blurEventHanlder();
            }

            // Reset searchresult after all
            self.searchResult = realList.data;
        });

        // Register keydown event
        html.onKeydown(function (e) {
            // Forward to keyDownEventHandler in dropdown prototype
            self.keyDownEventHandler(e);
        });

        // End of dropdown input
        html.$;

        // Render dropdown button
        html.button.attr({
        	tabIndex: -1
        }).onClick(function () {
            // Do nothing if the dropdown is disabled
            if (this.previousElementSibling.disabled) {
            	return;
            }

            // If button hasn't been clicked once, then
            if (!hasClickedOnce) {
                // Render the result
                html(self.ul).empty();
                self.renderSearchResult(self.searchResult);

                // Append the search result right under the input
                appendToInput(self.ul, self.input);

                // Show the ul
                self.$ul.show();

                // Set the flag "hasClickedOnce" be true
                hasClickedOnce = true;
            } else {
                // Toggle the ul
                self.$ul.toggle();
            }
        }, null, true).onBlur(function (e) {
            // Do nothing if user focus on the dropdown input
            if ($(this).prev().is(':focus')) {
            	return;
            }

            // Set the flag hasClickedOnce be false,
            // to make sure that we will render the list again on click dropdown button
            hasClickedOnce = false;

            // Forward to blurEventHanlder
            if (self.ul.style.display !== noDisplay) {
            	self.blurEventHanlder(e);
            }

            // Clear searchResult after all
            self.searchResult = realList._newData;
        });
        self.button = html.context;

        // Subscribe selectedValue change to update text of the input
        selectedValue.subscribe(function (val) {
            // Query the realList for new selected item
            var selectedItem = realList._newData.find(function (item) {
            	return item[self.valueField] === val;
            });

            // Set text for dropdown input
            self.input.value = selectedItem ? selectedItem[self.textField] : '';
        }).delay(0);

        // Subscribe change of the realList to update searchResult
        if (realList.subscribe) {
        	realList.subscribe(function (items) {
        		self.searchResult = items;
        	});
        }

        // Subscribe change from repository
        // to normalize text
        realList.subscribe(function (repo, item, index, action) {
        	switch (action) {
        		case 'add':
	        		var repoItem = {};
	        		html.extend(repoItem, item);
	        		self.repository[index] = repoItem;
	        		self.repository[index].NormalizedText = html.dropdown.prototype.normalize(item[self.textField]);
	        		break;
        		case 'remove':
	        		self.repository.splice(index, 1);
	        		break;
        		case 'update':
	        		self.repository[index].NormalizedText = self.normalize(item[self.textField]);
	        		break;
        		case 'render':
	        		if (repo == null) {
	        			break;
	        		}
	        		self.repository = [];
	        		repo.forEach(function (item) {
	        			var repoItem = {};
	        			html.extend(repoItem, item);
	        			repoItem.NormalizedText = self.normalize(item[self.textField]);
	        			self.repository.push(repoItem);
	        		});
	        		break;
        	}
        }).notify();

        // 12. Set context to html
        html(self.input);

    };

	/**
     * Prototype of dropdown, use prototype style for inheritance
     */
     html.dropdown.prototype = {
        /**
         * Query remote data source, override this for customized query
         * for example, customeize authentication
         * @param {String} url - Data source url
         * @return {html.ajax} Ajax request with promise pattern
         */
        queryDataSource: function (url) {
            // Query data list from source
            return html.getJSON(url)
                .header('Authorization', 'Bearer ' + window.localStorage.token);
        },
        getSelectedText: function () {
            // Get real array in the observable list.
            // Get real value in the selectedValue
            var list          = html.unwrapData(this.dataSource),
                selectedValue = html.unwrapData(this.selectedValue),
                foundItem     = null,
                valueField    = this.valueField;

            // Find the item in the list that matches the value in selectedValue
            foundItem = list.find(function (item) {
                return item[valueField] === selectedValue;
            });

            // Return found item text
            return foundItem ? foundItem[this.textField] : '';
        },
        /**
         * Render the search result
         * @param {Array} searchResult Array of list items
         */
         renderSearchResult: function (searchResult) {
         	var self = this,
         	ul = this.ul,
         	$ul = this.$ul;

            // 1. Set class name for ul container
            ul.className = 'dropdown-result';

            // 2. Let the selectedValue be the the value in the observer
            var selectedValue = this.selectedValue._newData;

            // 3. For each item in the resultSet
            html(ul).each(searchResult, function (item) {
                // a. Render list item for each result item
                html.li;

                // b. If the item is equal to selectedValue, then
                //    add class active to the list item
                if (item[self.valueField] === selectedValue) {
                	html.className(className.active);
                }

                // b. Register hover event
                html.onMouseenter(function () {
                    // i. Remove all active class in list items
                    $('li', ul).removeClass(className.active);

                    // ii. Set active class for current list item which is hovered on
                    $(this).addClass(className.active);
                }).onMouseleave(function () {
                    // Remove active class of current list items
                    $(this).removeClass(className.active);
                });

                // d.render text for list item
                html.span.css({width: '100%'}).text(item[self.textField]);
            });

            // 4. If there're no item selected, then
            //    set active class for first item
            if ($ul.find('li.' + className.active).length === 0) {
            	$ul.find('li').first().addClass(className.active);
            }
        },

        /**
         * Dropdown blur event handler
         * @param {Event} e Event arguments
         */
         blurEventHanlder: function (e) {
         	var self = this,
         	index,
         	selectedItem,
         	ul = this.ul,
         	$ul = this.$ul;

            // 1. Let index be the index of active LI in UL
            index = $ul.find('li').index($ul.find('.' + className.active));

            // 2. If there're no selected item in the list, then
            if (index < 0) {
                // a. Hide the ul
                $ul.hide();

                // b. Reset to the last selected index
                selectedItem = self.repository.find(function (item) {
                    // Compare without type checking.
                    // This is a hack because server side sometimes doesn't render correct type
                    // TODO: we should compare type too
                    return item[self.valueField] === self.selectedValue._newData;
                });
                if (selectedItem != null) {
                	self.input.value = selectedItem[self.textField];
                }

                // c. Exit the function
                return;
            } else {
            	selectedItem = this.searchResult[index];
            }

            // 3. Check if the value is actually changed
            if (selectedItem != null && this.selectedValue._newData !== selectedItem[self.valueField]) {
                // i. Forward to selected event handler
                this.selectedChange(selectedItem);
            }

            // 4. Set selected text back to the dropdown input
            if (selectedItem != null) {
            	this.input[self.valueField] = selectedItem[self.textField];
            }

            // 5. Finally, hide the dropdown ul
            //    and also remove from DOM
            //    to avoid memory leak after the dropdown disposed
            $ul.hide().remove();
        },

        /**
         * Keydown event handler for dropdown
         * @param {Event} e Event arguments
         */
         keyDownEventHandler: function (e) {
         	var ul = this.ul,
         	$ul = this.$ul,
         	keyCode = e.which || e.keyCode,
         	selectedIndex = -1,
         	selectedItem = null,
         	self = this,
         	selectedValue = this.selectedValue,
         	isListItemVisible = ul.style.display !== noDisplay;

            // 1. If we the key is not expected, then do nothing
            //    (expected keys are enter, escapse, arrow up and arrow down)
            //    otherwise, prevent default before processing
            if ([13, 27, 38, 40].indexOf(keyCode) < 0) {
            	return;
            }
            e.preventDefault();

            // 2. Let selectedItem be the item that has Value equal to observer
            selectedItem = this.searchResult.find(function (item) {
                // Compare without type checking.
                // This is a hack because server side sometimes doesn't render correct type
                // TODO: we should compare type too
                return item[self.valueField] === selectedValue._newData;
            });

            // 3. Let selectedIndex be the index of selectedItem in the list
            if (isListItemVisible) {
            	selectedIndex = $ul.find('li').index($ul.find('li.active'));
            } else {
            	selectedIndex = this.searchResult.indexOf(selectedItem);
            }

            // 4. Let selectedItem be the item in this.searchResult corresponding to selectedIndex.
            //    We have to set selectedItem again in case listItem container is visible,
            selectedItem = this.searchResult[selectedIndex];

            // 5. Process key down
            switch (keyCode) {
            	case KeyEvent.DOM_VK_ENTER:
            	case KeyEvent.DOM_VK_RETURN:
                    // a. If the ul is visible, then
                    if (isListItemVisible) {
                        // i. Hide the ul
                        $ul.hide();

                        // ii. Forward to selectedChange event handler
                        this.selectedChange(selectedItem);
                    } else {
                    	html(ul).empty();
                        // Just render the dropdown
                        this.renderSearchResult(this.searchResult);
                        appendToInput(this.ul, this.input);
                        $ul.show();
                        return;
                    }
                    break;
                    case KeyEvent.DOM_VK_UP:
                    // a. Check if selected index has reached to the top of the list
                    //    if true, then do nothing
                    if (selectedIndex <= 0 || selectedIndex >= this.searchResult.length) {
                    	return;
                    }

                    // b. Decrease selectedIndex by 1
                    selectedIndex--;
                    break;
                    case KeyEvent.DOM_VK_ESCAPE:
                    // Hide list items container
                    $ul.hide();
                    break;
                    case KeyEvent.DOM_VK_DOWN:
                    // a. Check if selected index has reached to the end of the list
                    //    if true, then do nothing
                    if (selectedIndex >= this.searchResult.length - 1) {
                    	return;
                    }

                    // b. Increase selectedIndex by 1
                    selectedIndex++;
                    break;
                }

            // 6. If listItem container is visible before and after pressing key, then
            //    Set active class to LI
            if (isListItemVisible) {
            	$ul.find('li').removeClass(className.active)
            	.eq(selectedIndex).addClass(className.active);
            } else {
            	selectedItem = this.searchResult[selectedIndex];
                // Forward to selectedChange event handler
                this.selectedChange(selectedItem);
            }
        },

        /**
         * Handle selected change event
         * @param {Object} selectedItem Selected item
         */
         selectedChange: function (selectedItem) {
         	if (selectedItem == null) {
         		return;
         	}

            // 1. Set the selected text back to the input
            this.input.value = selectedItem[this.textField];

            // 2. Set the observer value to be selectedItem value
            //    to make sure data is synchomized with UI
            this.selectedValue.data = selectedItem[this.valueField];

            // 3. Hide the list item container
            this.$ul.hide();
        },

        /**
         * Search the list with search term
         * @param {String} term Searching term
         * @returns {Array} Search result set
         */
         search: function (term) {
         	if (term == null || term === '') {
         		return this.repository;
         	}

            // 1. Normalize search term
            var normalizedTerm = html.dropdown.prototype.normalize(term);

            // 2. If after normalization, the searching term is an empty string,
            // return repository
            if (normalizedTerm === '') {
            	return this.repository;
            }

            // 3. Split the searching term by white space
            var words = normalizedTerm.split(' ');

            // 4. Search the repository
            return this.repository.filter(function (item) {
            	if (item.NormalizedText == null || item.NormalizedText === '') {
            		return false;
            	}

                // 2. Search each word in the text
                for (var i = 0, j = words.length; i < j; i++) {
                    // If there're any words doesn't match the item text,
                    // return false
                    if (item.NormalizedText.indexOf(words[i]) < 0) {
                    	return false;
                    }
                }

                // 3. Return true
                //    Because we've checked for each term in searching words
                return true;
            });
        }
    };

    /**
     * Remove Vietnamese characters from a string
     * @param {String} inpStr String to normalize
     * @returns {String} Normalized string
     */
     html.dropdown.prototype.normalize = function (inpStr) {
     	if (inpStr == null) {
     		return inpStr;
     	}

        return $.trim(inpStr).toLowerCase().replace(/\s{2,}/g, ' ');
    };

})(this.html, this.$, this.KeyEvent);