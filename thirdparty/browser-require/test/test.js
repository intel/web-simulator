function test(name, block) {
  if (arguments.length === 1) {
    block = name;
    name = null;
  }
  if (!name) {
    if (!test._nameCounter) test._nameCounter = 1;
    name = '(Untitled test '+(test._nameCounter++)+')';
  }
  var htmlBody = document.getElementsByTagName('body')[0];
  var assertions = [];
  var failedAssertions = [];
  var failcount = 0;
  function assert(cond, msg) {
    var e = new Error('Assertion error'+(msg ? ': '+msg:''));
    //var m = / /.exec(e.stack);
    var a = {error:e, cond:cond, msg:msg, caller:arguments.callee.caller};
    assertions.push(a);
    if (!cond) {
      var stack = String(e.stack || e).replace(/[\r\n][ \t]+at assert .+/g, '');
      try { e.stack = stack; } catch(e){}
      if (window.console) console.error(stack);
      failedAssertions.push(a);
    }
  }
  var suiteName = String(test.suiteName||'');
  var isDone = false;
  var done = function(err){
    if (isDone) return;
    isDone = true;
    var html = '';
    if (failedAssertions.length === 0 && !err) {
      html += '<span style="color:#092">'+assertions.length+
              ' assertions OK</span>';
    } else {
      html += '<span style="color:#c30">'+failedAssertions.length+' of '+
              assertions.length+' assertion'+(assertions.length === 1 ? '':'s')+
              ' FAILED</span>';
      failedAssertions.forEach(function(a){
        html += '<pre>'+a.error.stack.replace(/</g, '&lt;')+'</pre>';
      });
      if (err) {
        html += '<pre>'+String(err.stack || err).replace(/</g, '&lt;')+'</pre>';
      }
      html += '<br>';
    }
    html += '<br>';
    htmlBody.innerHTML += html;
  }
  htmlBody.innerHTML += '<b>'+(suiteName.length ? suiteName+': ' : '')+
                        name+'</b> ... ';
  try {
    var r = block(assert, done);
    if (r === undefined) done();
  } catch (err) {
    if (window.console) console.error(err.stack || err);
    done(err);
  }
}