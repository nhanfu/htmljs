(function () {
    'use strict';

    var currentSection = null,
        jsEditor = ace.edit($('.js-tab')[0]),
        htmlEditor = ace.edit($('.html-tab')[0]),
        result = $('.example-tab')[0],
        title = html.observable('Title'),
        previous = html.observable(''),
        next = html.observable(''),
        explain = $('.bs-example.explain > div');

    function getSectionParam(section) {
        return {
            title: $('#' + section + ' .title').html(),
            next: $('#' + section + ' .next').html(),
            previous: $('#' + section + ' .previous').html(),
            html: $('#' + section + ' .html').html(),
            js: $('#' + section + ' .js').html(),
            helphtml: $('#' + section + ' .help-html').html(),
            helpjs: $('#' + section + ' .help-js').html(),
            explain: $('#' + section + ' .explain').html()
        };
    }

    function execute(htmlStr, js) {
        if (htmlStr == null && js == null) {
            return;
        }
        htmlStr != null && htmlStr !== '' && $('.example-tab').html(htmlStr);
        if ($.trim(htmlEditor.getValue()) === '') {
            var a = eval(js);
            result.innerHTML = a;
        } else {
            new Function(js)();
        }
    }

    htmlEditor.setTheme("ace/theme/tomorrow");
    htmlEditor.getSession().setMode("ace/mode/html");
    htmlEditor.setOptions({ fontSize: 12, maxLines: 11, minLines: 17 });

    jsEditor.setTheme("ace/theme/tomorrow");
    jsEditor.getSession().setMode("ace/mode/javascript");
    jsEditor.setOptions({ fontSize: 12, maxLines: 15, minLines: 17 });

    $(function () {
        html('#previous').attr({ href: previous });
        html('#next').attr({ href: next });
        next.subscribe(function (nextSection) {
            html('#next').attr({ href: nextSection });
        });

        previous.subscribe(function (prevSection) {
            html('#previous').attr({ href: prevSection });
        });
    });

    if (location.hash === '') {
        location.href = '#step1';
    };

    html.router.when(location.pathname + '#:section', function (section) {
        currentSection = getSectionParam(section);
        currentSection.html != null && htmlEditor.setValue(currentSection.html);
        currentSection.js != null && jsEditor.setValue(currentSection.js);
        htmlEditor.gotoLine(1);
        jsEditor.gotoLine(1);
        $(result).html(currentSection.html);
        explain.html(currentSection.explain);
        dp.SyntaxHighlighter.HighlightAll('code');

        // set value for title, previous, next
        title.data = currentSection.title;
        next.data = currentSection.next;
        previous.data = currentSection.previous;
        execute(currentSection.html, currentSection.js);
    });

    $('#btnAction').on('click', function (e) {
        var jsText = jsEditor.getValue();
        var htmlText = htmlEditor.getValue();
        execute(htmlText, jsText);
    });

    $('.bs-example.explain').on('click', '#help', function () {
        jsEditor.setValue(currentSection.helpjs);
        htmlEditor.setValue(currentSection.helphtml);
        htmlEditor.gotoLine(1);
        jsEditor.gotoLine(1);
        execute(currentSection.helphtml, currentSection.helpjs);
    });
})();