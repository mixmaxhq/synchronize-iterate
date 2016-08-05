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
