var currentSection = function(section) {
        return {
            title: html('#' + section + ' .title').context.innerHTML,
            next: html('#' + section + ' .next').context.innerHTML,
            previous: html('#' + section + ' .previous').context.innerHTML,
            html: html('#' + section + ' .html').context.innerHTML,
            js: html('#' + section + ' .js').context.innerHTML
        }
    },
    jsEditor = ace.edit($('.js-tab')[0]),
    htmlEditor = ace.edit($('.html-tab')[0]),
    result = $('.example-tab')[0],
    title = html.observable('Title'),
    previous = html.observable(''),
    next = html.observable('');


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
html.router.when('#', function() {
    html.navigate('#introduction');
});

html.router.when(location.pathname + '#:section', function(section) {
    var curr = currentSection(section);
    htmlEditor.setValue(curr.html);
    htmlEditor.gotoLine(1);
    jsEditor.setValue(curr.js);
    jsEditor.gotoLine(1);
    $(result).html(curr.html);

    // set value for title, previous, next
    title.data = curr.title;
    next.data = curr.next;
    previous.data = curr.previous;
    if($.trim(htmlEditor.getValue()) === '') {
        var a = eval(curr.js);
        result.innerHTML = a;
    } else {
        new Function(curr.js)();
    }
});

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