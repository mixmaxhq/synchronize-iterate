var sync = require('synchronize');

/**
 * Iterate over the objects in the cursor, using synchronize.js. Expects a fiber
 * context.
 *
 * @param {{next: function(function(?Error, ?Object=))}} cursor An object with
 *   an asynchronous #next method.
 * @return {Iterable} An iterable representation of the cursor. May only be
 *   iterated once, and will resume from where the cursor was left off.
 */
function synchronizeIterate(cursor) {
  if (!cursor || typeof cursor !== 'object' || typeof cursor.next !== 'function') {
    throw new TypeError('expected cursor-like object');
  }

  var getNext = sync(cursor.next.bind(cursor));

  var iterator = {
    next: function() {
      var value = getNext(), done = !value;
      return {done: !value, value: value};
    }
  };

  var busy = false;

  // An object implementing the iterator protocol.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator
  return {
    [Symbol.iterator]() {
      if (busy) throw new Error('already iterating on cursor');
      busy = true;
      return iterator;
    }
  };
}

module.exports = synchronizeIterate;
