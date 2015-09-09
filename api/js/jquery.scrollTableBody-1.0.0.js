(function ($) {
    var defaults = {
        rowsToDisplay: 10
    };
    
    var scrollBarWidth = 15, fixedTableWidth;
    
    $.fn.scrollTableBody = function(options) {
        options = $.extend(defaults, options);
        
        var table = this;
        
        wrapTable(table, options);
        alignColumns(table);

        var resizeAlignFunction = function () { alignOnResize(table); };
        var canDebounce = typeof _ == 'function' && typeof _.debounce == 'function';
        if (canDebounce) resizeAlignFunction = _.debounce(resizeAlignFunction, 150);
        $(window).resize(resizeAlignFunction);
    };
    
    function wrapTable(table, options) {
        var existingClasses = table.attr('class');
        var existingMarginBottom = table.css('margin-bottom');
        table.css('margin-bottom', 0);
        var rowHeight = table.find('tbody tr:first').outerHeight();
        var tableHeight = rowHeight * options.rowsToDisplay;
        
        var headerTable = $('<table style="table-layout:fixed;width:auto;margin-bottom:0;" class="jqstb-header-table ' + existingClasses + '"><thead><tr><td></td></tr></thead></table>'),
            footerTable = $('<table style="table-layout:fixed;width:auto;margin-bottom:' + existingMarginBottom + ';" class="jqstb-footer-table ' + existingClasses + '"><tfoot><tr><td></td></tr></tfoot></table>'),
            scrollDiv = '<div class="jqstb-scroll" style="height:' + tableHeight + 'px;overflow-y:auto"></div>';
        
        // Insert the table that will hold the fixed header and footer, and insert the div that will get scrolled
        table.before(headerTable).before(scrollDiv).after(footerTable);
    }
    
    function alignColumns(table) {
        table.each(function (index) {
            // To minimize "Flash of Unstyled Content" (FOUC), set the relevant variables before manipulating the DOM
            var $dataTable = $(this);
            var $headerTable = $('table.jqstb-header-table').eq(index);
            var $footerTable = $('table.jqstb-footer-table').eq(index);
            
            // Place main table data inside of relevant scrollable div (using jQuery eq() and index)
            var $scrollDiv = $('div.jqstb-scroll').eq(index);
            $scrollDiv.prepend($dataTable);
            var scrollEl = $scrollDiv[0];
            
            var hasHorizontalScroll = scrollEl.clientWidth < scrollEl.scrollWidth;
            $scrollDiv.outerWidth(fixedTableWidth + scrollBarWidth + 2);
            
            if (hasHorizontalScroll) {
                var dataTableWidth = $dataTable.outerWidth();
                $headerTable.width(dataTableWidth);
                $footerTable.width(dataTableWidth);
                $scrollDiv.outerWidth(scrollEl.clientWidth);
                var scrollDivWidth = $scrollDiv.outerWidth();
                
                var width = scrollDivWidth - scrollBarWidth;
                
                var $headerScrollDiv = $('<div style="overflow:hidden;width:' + width + 'px" class="jqstb-header-scroll"></div>');
                $headerTable.wrap($headerScrollDiv);
                
                var $footerScrollDiv = $('<div style="overflow:hidden;width:' + width + 'px" class="jqstb-footer-scroll"></div>');
                $footerTable.wrap($footerScrollDiv);
                
                $scrollDiv.on('scroll', function() {
                    $('div.jqstb-header-scroll').scrollLeft($(this).scrollLeft());
                    $('div.jqstb-footer-scroll').scrollLeft($(this).scrollLeft());
                });
            }

            // Force column widths to be set for each header column
            $dataTable.find('thead tr:first th, tbody tr:first td').each(function () {
                $(this).outerWidth($(this).outerWidth());
            });
            
            // Insert header data into fixed header table
            $headerTable.find('thead').replaceWith($dataTable.children('caption, thead').clone());

            // Force column widths to be set for each footer column
            $dataTable.find('tfoot tr:first td').each(function () {
                $(this).outerWidth($(this).outerWidth());
            });
            
            // Insert footer data into fixed footer table
            $footerTable.find('tfoot').replaceWith($dataTable.children('tfoot').clone());
            
            // Hide original caption, header, and footer
            $dataTable.children('caption, thead, tfoot').hide();
        });
    }
    
    function alignOnResize(table) {
        table.each(function (index) {
            var $dataTable = $(this);
            var $headerTable = $('table.jqstb-header-table').eq(index);
            var $footerTable = $('table.jqstb-footer-table').eq(index);

            // Temporarily show the inner table's header and footer since the dom calculates width based on them being visible
            $dataTable.children('thead, tfoot').show();
            
            var scrollEl = $('div.jqstb-scroll')[0];
            var hasHorizontalScroll = scrollEl.clientWidth < scrollEl.scrollWidth;
            if (hasHorizontalScroll) {
                var scrollDivWidth = $('div.jqstb-scroll').outerWidth();
                $('div.jqstb-header-scroll').outerWidth(scrollDivWidth - scrollBarWidth);
                $('div.jqstb-footer-scroll').outerWidth(scrollDivWidth - scrollBarWidth);
            }
            
            // Force column widths to be set for each header column
            var $headerColumns = $headerTable.find('thead tr:first th');
            $dataTable.find('thead tr:first th').each(function (i) {
                $headerColumns.eq(i).outerWidth($(this).outerWidth());
            });

            // Force column widths to be set for each footer column
            var $footerColumns = $footerTable.find('tfoot tr:first td');
            $dataTable.find('tfoot tr:first td').each(function (i) {
                $footerColumns.eq(i).outerWidth($(this).outerWidth());
            });
            
            // Hide the inner table's header and footer when we're done 
            $dataTable.children('thead, tfoot').hide();
        });
    }
})(jQuery);