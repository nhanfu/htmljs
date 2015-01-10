(function () {
    var addDate = function (date, num) {
        var res = new Date(date);
        res.setDate(res.getDate() + num);
        return res;
    },
    diffDays = function (firstDate, secondDate) {
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
        return diffDays;
    },
    parseFormat = function (format) {
        var separator = format.match(/[.\/\-\s].*?/),
            parts = format.split(/\W+/);
        if (!separator || !parts || parts.length === 0){
            throw new Error("Invalid date format.");
        }
        return {separator: separator, parts: parts};
    },
    parseDate = function(date, format) {
        var parts = date.split(format.separator),
            date = new Date(),
            val;
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        if (parts.length === format.parts.length) {
            var year = date.getFullYear(), day = date.getDate(), month = date.getMonth();
            for (var i=0, cnt = format.parts.length; i < cnt; i++) {
                val = parseInt(parts[i], 10)||1;
                switch(format.parts[i]) {
                    case 'dd':
                    case 'd':
                        day = val;
                        date.setDate(val);
                        break;
                    case 'mm':
                    case 'm':
                        month = val - 1;
                        date.setMonth(val - 1);
                        break;
                    case 'yy':
                        year = 2000 + val;
                        date.setFullYear(2000 + val);
                        break;
                    case 'yyyy':
                        year = val;
                        date.setFullYear(val);
                        break;
                }
            }
            date = new Date(year, month, day, 0 ,0 ,0);
        }
        return date;
    },
    formatDate = function (date, format) {
        var val = {
            d: date.getDate(),
            m: date.getMonth() + 1,
            yy: date.getFullYear().toString().substring(2),
            yyyy: date.getFullYear()
        };
        val.dd = (val.d < 10 ? '0' : '') + val.d;
        val.mm = (val.m < 10 ? '0' : '') + val.m;
        var date = [];
        for (var i=0, cnt = format.parts.length; i < cnt; i++) {
            date.push(val[format.parts[i]]);
        }
        return date.join(format.separator);
    },
    dates = {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: html.data(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
    };
    
    html.datepicker = function (observer) {
        observer.lazyInput = true;
        // we assume that user want to display date-picker under an input
        var input = html.element(),
        format = parseFormat(observer.format || 'dd/mm/yyyy'),
        isSelectingDate = false,
        date = html.data(observer() || new Date),
        monthYear = html.data(function () {
            return dates.months[date().getMonth()] + ' ' + date().getFullYear();
        }),
        month = html.data(function () {
            return date().getMonth();
        }),
        year = html.data(function () {
            return date().getFullYear();
        }),
        decade = html.data(function () {
            var yy    = year().toString(),
                begin = year() - yy[yy.length - 1],
                res   = [];
            for (var i = -1; i < 11; i++) res.push(begin+i);
            return res;
        }),
        decadeText = html.data(function () {
            var dc = decade();
            return dc[1] + ' - ' + dc[dc.length - 2];
        }),
        firstDateOfMonth = html.data(function () {
            return new Date(date().getFullYear(), date().getMonth(), 1);
        }),
        firstDate = html.data(function () {
            return addDate(firstDateOfMonth(), -firstDateOfMonth().getDay());
        }),
        lastDateOfMonth = html.data(function () {
            return new Date(date().getFullYear(), date().getMonth() + 1, 0);
        }),
        lastDate = html.data(function () {
            return addDate(firstDate(), 42);
        }),
        weeks = html.data(function () {
            return diffDays(lastDate(), firstDate())/7;
        }),
        addMonthYear = function (num, isYear) {
            var currDate = html.getData(date),
                changed  = new Date(currDate.getFullYear(), currDate.getMonth() + num, 1);
            if (isYear) {
                changed = new Date(currDate.getFullYear() + num, currDate.getMonth(), 1);
            }
            date(changed);
            dates.monthsShort.refresh();
        },
        isSelectDate = html.data(true).subscribe(function (val) {
            if (val === true) {
                isSelectMonth(false);
            }
        }),
        isSelectMonth = html.data(false).subscribe(function (val) {
            if (val === true) {
                isSelectDate(false);
                isSelectYear(false);
                dates.monthsShort.refresh();
            }
        }),
        isSelectYear = html.data(false).subscribe(function (val) {
            if (val === true) {
                isSelectMonth(false);
            }
        }),
        div = html.createEleNoParent('div').$$();
        
        document.body.appendChild(div);
        
        html(div).addClass('datepicker dropdown-menu')
            .div().addClass('datepicker-days').css({display: 'block'}).visible(isSelectDate)
                .table().addClass('table-condensed')
                    .thead()
                        .tr()
                            .th().addClass('prev').text('&lsaquo;').click(function () {
                                addMonthYear(-1);
                            }).$()
                            .th().addClass('switch').attr({colspan: 5}).text(monthYear).click(function () {
                                isSelectMonth(true);
                                dates.monthsShort.refresh();
                            }).$()
                            .th().addClass('next').text('&rsaquo;').click(function () {
                                addMonthYear(1);
                            }).$()
                        .$() // end of tr
                        .tr().each(dates.daysMin, function (day) {
                            html.th().addClass('dow').text(day);
                        }).$() // end of tr
                    .$('table') // go to table tag
                    
                    .tbody().each(weeks, function (week) {
                        html.tr().each(7, function (day) {
                            var currDate = addDate(firstDate(), week * 7 + day);
                            html.td(currDate.getDate()).addClass('day').click(function () {
                                isSelectingDate = true;
                                observer(html(this).expando('date'));
                                input.value = formatDate(observer(), format);
                                date(html(this).expando('date'));
                            }).expando('date', currDate);
                            
                            var selectedDate = html.getData(observer);
                            selectedDate && currDate.getFullYear() === selectedDate.getFullYear()
                                && currDate.getMonth() === selectedDate.getMonth()
                                && currDate.getDate() === selectedDate.getDate()
                                && html.addClass('active');
                            currDate.getMonth() < date().getMonth() && html.addClass('old');
                            currDate.getMonth() > date().getMonth() && html.addClass('new');
                        });
                    }).$()
                .$() // end of table
            .$() // end of datepicker-days
        .$(); // end of datepicker
        
        // render month picker
        html(div)
            .div().addClass('datepicker-months').css('display', 'block').visible(isSelectMonth)
                .table().addClass('table-condensed')
                    .thead()
                        .tr()
                            .th('&lsaquo;').addClass('prev').click(function () {
                                addMonthYear(-1, true);
                            }).$()
                            .th(year).addClass('switch').attr({colspan: 5}).click(function () {
                                isSelectYear(true);
                            }).$()
                            .th('&rsaquo;').addClass('next').click(function () {
                                addMonthYear(1, true);
                            }).$()
                        .$() // end of tr
                    .$() // end of thead
                    
                    .tbody()
                        .tr()
                            .td().attr({colspan: 7}).each(dates.monthsShort, function (m) {
                                html.span(m).addClass('month').click(function () {
                                    var mon = html(this).expando('month');
                                    mon = html.array.indexOf.call(dates.monthsShort(), mon);
                                    var currDate = date();
                                    date(new Date(currDate.getFullYear(), mon, 1));
                                    isSelectDate(true);
                                    isSelectingDate = true;
                                });
                                if (html.array.indexOf.call(dates.monthsShort(), m) === month() && observer().getFullYear() === year()) html.addClass('active');
                                html.expando('month', m);
                            }).$() // end of td
                        .$() // end of tr
                    .$() // end of tbody
                .$() // end of table
            .$() // end of datepicker-months
        
        // render year picker
        html(div)
            .div().addClass('datepicker-years').css('display', 'block').visible(isSelectYear)
                .table().addClass('table-condensed')
                    .thead()
                        .tr()
                            .th('&lsaquo;').addClass('prev').click(function () {
                                addMonthYear(-10, true);
                            }).$()
                            .th(decadeText).addClass('switch').attr({colspan: 5}).$()
                            .th('&rsaquo;').addClass('next').click(function () {
                                addMonthYear(10, true);
                            }).$()
                        .$() // end of tr
                    .$() // end of thead
                    
                    .tbody()
                        .tr()
                            .td().attr({colspan: 7}).each(decade, function (y) {
                                html.span(y).addClass('year').click(function () {
                                    var y = html(this).expando('year');
                                    var currDate = date();
                                    date(new Date(y, currDate.getMonth(), 1));
                                    isSelectMonth(true);
                                    isSelectingDate = true;
                                });
                                if (y === year()) html.addClass('active');
                                html.expando('year', y);
                            }).$() // end of td
                        .$() // end of tr
                    .$() // end of tbody
                .$() // end of table
            .$() // end of datepicker-months
        
        document.body.removeChild(div);
        html(document).click(function (e) {
            var src = e.target || e.srcElement;
            if (src === input) return;
            if (!isSelectingDate && !div.contains(src)) {
                document.body.removeChild(div);
            }
            isSelectingDate = false;
        });
        
        html(input).click(function () {
            document.body.appendChild(div);
            var offset = html(input).offset();
            var height = parseInt(html(input).css('height'));
            html(div).css({
                top: offset.top + height,
                left: offset.left
            });
        }).change(function () {
            observer(parseDate(this.value, format));
        });
        observer.subscribe(function (val) {
            date(val);
            input.value = formatDate(observer(), format);
        });
    };
})();