html(function() {
    dp.SyntaxHighlighter.HighlightAll('code');
    var jsEditor = [], htmlEditor = [];
    $('.js-tab').each(function(index){
        jsEditor[index] = ace.edit(this);
        jsEditor[index].setTheme("ace/theme/tomorrow");
        jsEditor[index].getSession().setMode("ace/mode/javascript");
        var options = { fontSize: 12, maxLines: 15, minLines: 15 };
        jsEditor[index].setOptions(options);
    });
    $('.html-tab').each(function(index){
        htmlEditor[index] = ace.edit(this);
        htmlEditor[index].setTheme("ace/theme/tomorrow");
        htmlEditor[index].getSession().setMode("ace/mode/html");
        var options = { fontSize: 12, maxLines: 11, minLines: 11 };
        htmlEditor[index].setOptions(options);

        var jsText = jsEditor[index].getValue();
        var htmlText = htmlEditor[index].getValue();
        $($('.example-tab')[index]).empty().append($(htmlText));
        try {
            jsText = '(function(){' + jsText + '})()';
            eval(jsText);
            $($('.example-tab')[index]).unbind();
        } catch(e){}
    });

    $('#btnAction').on('click', function(e) {
        var jsText = jsEditor[0].getValue();
        var htmlText = htmlEditor[0].getValue();
        $('.example-tab').empty().append($(htmlText));
        try {
            jsText = '(function(){' + jsText + '})()';
            eval(jsText);
            $('.example-tab').unbind();
        } catch(e){}
    });
});