synchronize-iterate
===================

Native iteration over cursor-like objects with [synchronize.js](http://alexeypetrushin.github.io/synchronize/docs/index.html).

[![Build Status](https://travis-ci.org/mixmaxhq/synchronize-iterate.svg?branch=master)](https://travis-ci.org/mixmaxhq/synchronize-iterate)

Given a cursor-like object - one with an asynchronous #next method - produces an ES6 iterator.

```js
var sync = require('synchronize');
var syncIter = require('synchronize-iterate');

sync.fiber(function() {
  var cursor = new Cursor();
  for (var value of syncIter(cursor)) {
    // prints, in order, 1, then 2, then 3
    console.log(value);
  }

  // prints after the 3
  console.log('done');
});
```

Requires a version of Node that supports
[symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
and the [iterator
protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator).

What? Why?
----------

This pattern sometimes comes up if you want to iterate over a MongoDB cursor. You might be tempted
to use the `forEach` from [mongojs](https://github.com/mafintosh/mongojs):

```js
sync.fiber(function() {
  // help i want to iterate over this!
  var cursor = db.collection('users').find();

  cursor.forEach(function(err, user) {
    // handle the users
  });

  // this prints before the first document even arrives
  console.log('all done!');
});
```

This clearly doesn't integrate well with synchronize, and you'd have to add a special `sync.defer`
call for when `user` is finally `null`. You might then decide to try `next` directly:

```js
sync.fiber(function() {
  // help i still want to iterate over this!
  var cursor = db.collection('users').find();

  for (var user; (user = sync.await(cursor.next(sync.defer()))); ) {
    // handle the users
  }

  // this prints correctly now
  console.log('all done!');
});
```

This integrates better with synchronize, but now it's a bit ugly. Some people might even factor it
into a `while` loop. Instead, use `synchronize-iterate`!

Install
-------

```sh
$ npm install synchronize-iterate
```

API
---

### syncIter(cursor)

Creates an iterator for the given cursor.

Note that this will throw an error if one tries to iterate twice:

```js
// in a fiber
var iter = syncIter(cursor);
for (var value of iter);
for (var value of iter); // throws an error
```

You can also pass an optional batch size which will cause the iterator to
return results in bulk.

```js
// in a fiber
let iter = syncIter(cursor, 5);
for (var value of iter) {
  // value is an array or 5 elements (or fewer if there were not five
  // left to retrieve)
}
```

Changelog
---------
* 0.2.0 Add optional batch size parameter support.
* 0.1.2 Add what? why? section to the README.
* 0.1.1 Minor update to the README.
* 0.1.0 Initial Release.


License
-------

> The MIT License (MIT)
>
> Copyright &copy; 2016 Mixmax, Inc ([mixmax.com](https://mixmax.com))
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in allcopies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
