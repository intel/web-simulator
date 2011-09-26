var foo = require('../foo');
exports.hello = 'hello from the something module';
exports.helloFromFoo = foo.hello;
exports.myUri = module.uri;
