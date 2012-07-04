# browser-require

[CommonJS module](http://wiki.commonjs.org/wiki/Modules) system for web browsers.

## Usage & examples

Firt off, you need to load `require.js` -- i.e. `<script src="require.js"></script>` -- then...

### Embedded module definitions

    <script>
    require.define('foo', function(require, module, exports){
      exports.hello = "hello from the foo module";
    });
    var foo = require('foo');
    alert(foo.hello);
    </script>

> Pssst! You can find more examples in the `example` directory.

### Loading (and defining) remote modules

foo.js

    exports.hello = "hello from the foo module";

index.html

    <script>
    require.load('foo.js', function (err) {
      if (err) throw err;
      var foo = require('foo');
      alert(foo.hello);
    });
    </script>

#### Multiple remote modules can be loaded in parallel

    <script>
    require.load([
      'foo.js',
      'bar/baz.js',
      {id: 'user-agent', url:'http://internets.com/lib/ua.js'}
      {'http://moset.com/strkit/formatting.js'}
    ], function (err) {
      if (err) throw err;
      var foo = require('foo'),
          baz = require('bar/baz'),
          userAgent = require('user-agent'),
          formatting = require('strkit/formatting');
      alert(foo.hello);
      // ...
    });
    </script>

#### Remote modules can also be loaded synchronously

> **Warning:** synchronous loading will block until they complete. This should only be used when loading files from reliable/fast sources (like localhost or file://).

    <script>
    require.load(['foo.js', 'bar/baz.js']);
    var foo = require('foo'),
        baz = require('bar/baz');
    alert(foo.hello);
    // ...
    </script>

## API

### require(String id[, String parentId]) -> [object module-exports]

Import module with identifier `id`.

- `id` can be a relative path like "./foo" or "../../foo", but only makes sense when `require` is called from within another module or `parentId` is provided.

### require.define(String id, [String uri,] Function block(require, module, exports){...})

Define a module, adding it to the list of available modules. The `block` function will be called (once) at the first `require` of the module (i.e. the actual execution is delayed/lazy).

If the `uri` argument is given, the resulting module will have a read-only `uri` property referring to that value. This is optional per the CommonJS spec.

You module (the code inside `block`) should export its API through the `exports` object like so:

    require.define('foo', function(require, module, exports){
      exports.hello = "hello from foo";
    });
    ...
    var foo = require('foo');
    puts(foo.hello); // -> "hello from foo"

It's also possible to *set* the `exports` object:

    require.define('foo', function(require, module, exports){
      exports = module.exports = function() {
        return "hello from foo function"
      }
      exports.hello = "hello from foo";
    });
    ...
    var foo = require('foo');
    puts(foo()); // -> "hello from foo function"
    puts(foo.hello); // -> "hello from foo"


### require.main -> [object module]

The top level module object (read-only). This modules' `exports` member normally refers to `window`.

    require.main === window === true


### require.load(Object spec|Array specs|String url[, Function callback(Error err)])

Load and define a remotely located module.

A `spec` object should have at least one of two properties:

    { url: String  // URL or path to the module resource
    , id:  String  // Module identifier
    }

- If no `url` is given, `url` is created from `id` by appending ".js"
- If no `id` is given, `id` is deduced from `url` by stripping anything else than path and also stripping any filename extension.

You can also pass an array of `spec` objects or strings. Passing a string is equivalent to passing a `spec` object like this: `{url: url}`

**Note:** If no `callback` is passed, **loading will be synchronous**.


### [object module]

A module object have the following members:

- `exports` -- an object representing the API
- `id` -- Identifier (read-only)

Optional/not-always-there members:

- `uri` -- URI which might be a URL denoting the module source


## MIT license

Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
