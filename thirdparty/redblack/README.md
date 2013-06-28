redblack.js
===========

redblack.js is a red-black tree implementation for Node.js and the browser.

Usage
-----

    var tree = redblack.tree();
    
    tree.insert('foo', 'bar');
    tree.get('foo'); // -> 'bar'
    
    tree.delete('foo');
    tree.get('foo'); // -> null
    
    tree.forEach(function(value, key) {
        console.log(key + '=' + value);
    });

Download
--------

Releases are available on [GitHub](https://github.com/scttnlsn/redblack.js/downloads)
or via [NPM](http://search.npmjs.org/#/redblack).

    npm install redblack

**Development:** [redblack.js](https://raw.github.com/scttnlsn/redblack.js/master/redblack.js)

**Production:**  [redblack.min.js](https://raw.github.com/scttnlsn/redblack.js/master/redblack.min.js)

Tree API
--------

### insert(key, value)

Insert the given key/value pair into the tree.

*Arguments:*

* key
* value

### get(key)

Get the value mapped to the given key or `null` if no such value exists.

*Arguments:*

* key

### delete(key)

Remove the given key from the tree

*Arguments:*

* key

### range(start, end)

Returns a [Cursor](#cursor) (see below) for traversing the tree in the given range (inclusive).

*Arguments:*

* start - the lower bound of the range, if `undefined` then assumed to be the minimum value in the tree
* end - the upper bound of the range, if `undefined` the assumed to be the maximum value in the tree

### forEach(iterator)

[Cursor](#cursor) shortcut for iterating over the entire tree (see [forEach](#forEach) below).

### map(iterator)

[Cursor](#cursor) shortcut for mapping over the entire tree (see [map](#map) below).

<a name="cursor" />
Cursor API
----------

<a name="forEach" />
### forEach(iterator)

Iterate over a set of nodes in order.

*Arguments:*

* iterator(value, key, tree)

<a name="map" />
### map(iterator)

Map over a set of nodes in order.

*Arguments:*

* iterator(value, key, tree) - should return a result
