//Register route  
html.router.when(location.pathname + '#user/:id/details', function(id){
    document.getElementById('content1').style.display = '';
    document.getElementById('content2').style.display = 'none';
    document.getElementById('content3').style.display = 'none';
});
html.router.when(location.pathname + '#user/:id/edit', function(id){
    document.getElementById('content1').style.display = 'none';
    document.getElementById('content2').style.display = '';
    document.getElementById('content3').style.display = 'none';
});
html.router.when(location.pathname + '#user/:id/delete', function(id){
    document.getElementById('content1').style.display = 'none';
    document.getElementById('content2').style.display = 'none';
    document.getElementById('content3').style.display = '';
});
//Ignore route  
html.router.ignoreRoute(':page.html#:section');
html.router.ignoreRoute(':page.html');

dp.SyntaxHighlighter.HighlightAll('code');

html(document).onDOMContentLoaded(function () {
    var jsEditor = [], htmlEditor = [];
    $('.js-tab').each(function(index){
      jsEditor[index] = ace.edit(this);
    })
    
    $('.html-tab').each(function(index){
      htmlEditor[index] = ace.edit(this);
      htmlEditor[index].setTheme("ace/theme/tomorrow");
      htmlEditor[index].getSession().setMode("ace/mode/html");
      var options;
      if($('.html-tab').length === 1) {
          options = { fontSize: 14, maxLines: 20, minLines: 10 };
      } else {
          options = { fontSize: 14, maxLines: 15, minLines: 7 };
      }
      htmlEditor[index].setOptions(options);
      (function(index){
        htmlEditor[index].on('change', function(e){
          var jsText = jsEditor[index].getValue();
          var htmlText = htmlEditor[index].getValue();
          $($('.example-tab')[index]).empty().append($(htmlText));
          html.query('[id]', $('.example-tab')[index]).each(function (item) {
            html.id[item.id] = '#' + item.id;
          });
          try {
            jsText = '(function(){' + jsText + '})()';
            eval(jsText);
            $($('.example-tab')[index]).unbind();
          } catch(e){}
        });
      })(index);
      
      var jsText = jsEditor[index].getValue();
      var htmlText = htmlEditor[index].getValue();
      $($('.example-tab')[index]).empty().append($(htmlText));
      // $('[id]', $('.example-tab')[index]).each(function (item) {
      //   html.id[item.id] = '#' + item.id;
      // });
      try {
        jsText = '(function(){' + jsText + '})()';
        eval(jsText);
        $($('.example-tab')[index]).unbind();
      } catch(e){}
    });
    
    $('.js-tab').each(function(index){
      jsEditor[index].setTheme("ace/theme/tomorrow");
      jsEditor[index].getSession().setMode("ace/mode/javascript");
      var options;
      if($('.js-tab').length === 1) {
          options = { fontSize: 14, maxLines: 20, minLines: 10 };
      } else {
          options = { fontSize: 14, maxLines: 15, minLines: 7 };
      }
      jsEditor[index].setOptions(options);
      (function(index){
        jsEditor[index].on('change', function(e){
          var jsText = jsEditor[index].getValue();
          var htmlText = htmlEditor[index].getValue();
          $($('.example-tab')[index]).empty().append($(htmlText));
          try {
            jsText = '(function(){' + jsText + '})()';
            eval(jsText);
            $($('.example-tab')[index]).unbind();
          } catch(e){}
        });
      })(index);
    });
});