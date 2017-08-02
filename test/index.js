/* eslint-disable no-unused-vars */
var sync = require('synchronize');
var expect = require('chai').expect;

var syncIter = require('..');

function Cursor(array) {
  this._iter = array[Symbol.iterator]();
}

Cursor.prototype.next = function(callback) {
  var result = this._iter.next();

  setImmediate(function() {
    callback(null, result.done ? null : result.value);
  });
};

var spread = getSpreadOperator(),
  sit = spread ? it : xit;

describe('synchronize-iterate', function() {
  it('should fail unless given cursor-like object', function() {
    expect(function() {
      syncIter(null);
    }).to.throw(TypeError);

    expect(function() {
      syncIter({});
    }).to.throw(TypeError);

    expect(function() {
      syncIter({next: true});
    }).to.throw(TypeError);
  });

  it('should iterate', function(done) {
    sync.fiber(function() {
      var array = [1, 2, 3],
        cursor = new Cursor([1, 2, 3]),
        arrayIter = array[Symbol.iterator](),
        n = 0;
      for (var item of syncIter(cursor)) {
        expect(item).to.equal(arrayIter.next().value);
        ++n;
      }
      expect(n).to.equal(array.length);
    }, done);
  });

  it('should be able to iterate in a bulk fashion', function(done) {
    sync.fiber(function() {
      var array = [1, 2, 3],
        cursor = new Cursor([1, 2, 3]);
      for (var items of syncIter(cursor, 3)) {
        expect(items).to.have.length(3);
        expect(items).to.have.members(array);
      }

      // Re-initialize the cursor.
      cursor = new Cursor([1, 2, 3]);
      var batches = [];
      for (var batch of syncIter(cursor, 2)) {
        batches.push(batch);
      }

      var fullBatch = batches[0];
      expect(fullBatch).to.have.length(2);
      expect(fullBatch).to.have.members([1, 2]);
      var halfBatch = batches[1];
      expect(halfBatch).to.have.length(1);
      expect(halfBatch).to.have.members([3]);
    }, done);
  });

  it('should iterate over no items', function(done) {
    sync.fiber(function() {
      for (var item of syncIter(new Cursor([]))) {
        expect.fail('non-empty', 'empty', 'expected iterator to be empty', 'for');
      }
    }, done);
  });

  it('should fail to iterate multiple times', function(done) {
    sync.fiber(function() {
      var iter = syncIter(new Cursor([]));
      for (var item of iter);
      expect(function() {
        for (var item of iter);
      }).to.throw(/already iterating/);
    }, done);
  });

  sit('should work with spread', function(done) {
    sync.fiber(function() {
      var array = [1, 2, 3],
        cursor = new Cursor([1, 2, 3]);

      expect(array).to.deep.equal(spread(syncIter(cursor)));
    }, done);
  });
});

function getSpreadOperator() {
  try {
    var spread = new Function('iterator', 'return [...iterator];'),
      v = spread([1, 2]);

    if (Array.isArray(v) && v.length === 2 && v[0] === 1 && v[1] === 2) {
      return spread;
    }
  } catch (err) {
    // Empty catch block
  }
  return null;
}
