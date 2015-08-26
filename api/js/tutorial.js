var currentSection = function(section) {
        return {
            title: html('#' + section + ' .title').$$().innerHTML,
            next: html('#' + section + ' .next').$$().innerHTML,
            previous: html('#' + section + ' .previous').$$().innerHTML,
            html: html('#' + section + ' .html').$$().innerHTML,
            js: html('#' + section + ' .js').$$().innerHTML
        }
    },
    jsEditor = ace.edit($('.js-tab')[0]),
    htmlEditor = ace.edit($('.html-tab')[0]),
    result = $('.example-tab')[0],
    title = html.data('Title'),
    previous = html.data(''),
    next = html.data('');


htmlEditor.setTheme("ace/theme/tomorrow");
htmlEditor.getSession().setMode("ace/mode/html");
htmlEditor.setOptions({ fontSize: 12, maxLines: 11, minLines: 11 });

jsEditor.setTheme("ace/theme/tomorrow");
jsEditor.getSession().setMode("ace/mode/javascript");
jsEditor.setOptions({ fontSize: 12, maxLines: 15, minLines: 15 });

html(function() {
    html('h1.title').text(title);
    html('#previous').attr({href:previous});
    html('#next').attr({href: next});
});
if(location.hash === '') {
    html.navigate('#introduction');
}
html.router('#', function() {
    html.navigate('#introduction');
});

html.router(location.pathname + '#:section', function(section) {
    var curr = currentSection(section);
    htmlEditor.setValue(curr.html);
    htmlEditor.gotoLine(1);
    jsEditor.setValue(curr.js);
    jsEditor.gotoLine(1);
    html(result).unbindAll();
    $(result).html(curr.html);
    html.query('[id]', result).each(function (item) {
        html.id[item.id] = '#' + item.id;
    });

    // set value for title, previous, next
    title(curr.title);
    next(curr.next);
    previous(curr.previous);
    if(html.trim(htmlEditor.getValue()) === '') {
        var a = eval(curr.js);
        result.innerHTML = a;
    } else {
        new Function(curr.js)();
    }
});
html.router.process();

$('#btnAction').on('click', function(e) {
    var jsText = jsEditor.getValue();
    var htmlText = htmlEditor.getValue();
    $('.example-tab').html(htmlText);
    html.query('[id]', $('.example-tab')[0]).each(function (item) {
        html.id[item.id] = '#' + item.id;
    });
    try {
        if(html.trim(htmlEditor.getValue()) === '') {
            var a = eval(jsText);
            result.innerHTML = a;
        } else {
            new Function(jsText)();
        }
    } catch(e){}
});