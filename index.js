'use strict';

const sync = require('synchronize');

/**
 * Iterate over the objects in the cursor, using synchronize.js. Expects a fiber
 * context.
 *
 * @param {{next: function(function(?Error, ?Object=))}} cursor An object with
 *   an asynchronous #next method.
 * @param {Number} batchSize (optional) An optional batch size to return opjects
 *   in. If provided an array is returned from each call to next() of the
 *   returned Iterable. If it is not provided, the default behavior of returning
 *   each value on it's own is used.
 * @return {Iterable} An iterable representation of the cursor. May only be
 *   iterated once, and will resume from where the cursor was left off.
 */
function synchronizeIterate(cursor, batchSize) {
  if (!cursor || typeof cursor !== 'object' || typeof cursor.next !== 'function') {
    throw new TypeError('expected cursor-like object');
  }

  // Default to a batch size of one if none is provided.
  batchSize = batchSize || 1;
  let runningAsBatch = batchSize > 1;

  let getNext = sync(cursor.next.bind(cursor));

  let iterator = {
    next: runningAsBatch ? function() {
      let values = [];
      for (let i = 0; i<batchSize; i++) {
        var value = getNext();
        if (!value) {
          // If we had some cached, it's the last batch, return it with done
          // false, and the next call to `next()` will return `done: true`.
          if (values.length) {
            return { done: false, value: values };
          }
          return { done: true };
        }

        values.push(value);
      }

      return { done: false, value: values };
    } : function() {
      let value = getNext();
      return {done: !value, value: value};
    }
  };

  let busy = false;

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
