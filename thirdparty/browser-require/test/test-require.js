test.suiteName = 'require';

test('basics', function(assert){
  require.define('foo', function(require, module, exports){
    exports.bar = "bar";
  });
  var foo = require('foo');
  assert(typeof foo === 'object');
  assert(foo === require('foo'));
  assert(foo.bar === 'bar');
})

test('cyclic', function(assert){
  require.define('foo', function(require, module, exports){
    var other = require('grek');
    exports.foo = "bar";
    try {
      exports.resultFromOtherFun1 = other.fun1();
    } catch (e) {
      exports.resultFromOtherFun1 = e;
    }
    exports.resultFromOtherFun2 = other.fun2();
    exports.fun1 = function() {
      console.log(">> called foo.fun1");
      return other.fun2("from foo");
    }
    exports.fun2 = function() {
      console.log(">> called foo.fun2");
      return 'foo.fun2';
    }
  });

  require.define('grek', function(require, module, exports){
    var other = require('foo');
    exports.grek = "hej";
    exports.fun1 = function() {
      console.log(">> called grek.fun1");
      return other.fun2("from grek");
    }
    exports.fun2 = function() {
      console.log(">> called grek.fun2");
      return 'grek.fun2';
    }
  });

  // basic tests including cyclic dependencies
  var foo = require('foo');
  assert(typeof foo === 'object', 1);
  assert(typeof foo.fun1 === 'function', 2);
  assert(typeof foo.fun2 === 'function', 3);
  assert(foo.fun1() === 'grek.fun2', 4);
  assert(foo.fun2() === 'foo.fun2', 5);
  assert(foo.resultFromOtherFun1 instanceof Error, 6); // was cyclic
  assert(foo.resultFromOtherFun2 === 'grek.fun2', 7);

});

test('relative', function(assert){
  require.define('foo/bar', function(require, module, exports){
    exports.hello = "hello from "+module.id;
  });
  require.define('foo/baz', function(require, module, exports){
    exports.hello = "hello from "+module.id;
    var other = require('./bar');
    exports.helloFromOther = other.hello;
    exports.foo1 = require('./');
    exports.foo2 = require('../foo');
  });
  require.define('foo/bar/thisis/deep', function(require, module, exports){
    exports.hello = "hello from "+module.id;
    var other = require('../../xyz/../a/b//../../baz');
    exports.helloFromOther = other.hello;
  });
  require.define('foo/bar/thisis/even/deeper', function(require, module, exports){
    exports.hello = "hello from "+module.id;
    var other = require('../../thisis/deep');
    exports.helloFromOther = other.hello;
  });

  var baz = require('foo/baz');
  assert(baz.hello === 'hello from foo/baz');
  assert(baz.helloFromOther === 'hello from foo/bar');
  assert(baz.foo1.foo === "bar");
  assert(baz.foo1 === baz.foo2);

  var baz = require('./././foo/baz'); // ./ should have no effect
  assert(baz.hello === 'hello from foo/baz');
  assert(baz.helloFromOther === 'hello from foo/bar');

  var deep = require('foo/bar/thisis/deep');
  assert(deep.hello === 'hello from foo/bar/thisis/deep');
  assert(deep.helloFromOther === 'hello from foo/baz');

  var deeper = require('foo/bar/thisis/even/deeper');
  assert(deeper.hello === 'hello from foo/bar/thisis/even/deeper');
  assert(deeper.helloFromOther === 'hello from foo/bar/thisis/deep');

});