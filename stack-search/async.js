(function() {
'use strict';

/**
 * Await/async-style async functions using generators, using `yield` for `await`.
 * 
 * const getName = async(function*(dataUrl) {
 *   const response = yield fetch(dataUrl);
 *   const data = yield response.json();
 *   return data.name;
 * });
 */
const async = (generator) => () => {
  const args = arguments;
  return new Promise((resolve, reject) => {
    const iterator = generator.apply(null, args);

  	const runNext = (lastResult) => {
  		try {
  			const next = iterator.next(lastResult);

        // What if there's an error here?
  			if (next.done) {
  				resolve(next.value);
  	      iterator = null;
  			} else {
  				Promise.resolve(next.value).then((result) => {
  					async.do(() => runNext(result));
  				}, (error) => {
            iterator.throw(error);
  				});
  			}
  		} catch (ex) {
  			reject(ex);
  		}
  	};

    async.do(() => runNext(undefined));
  });
};


/**
 * Promise-calls a function in a microtask.
 * @param {function()} f
 * @return {Promise} The value returned by the function.
 */
async.do = (f) => Promise.resolve().then(() => f());


/**
 * @param {duration} A duration in milliseconds.
 * @return {Promise} A promise that will resolve after duration has elasped.
 */
async.waitForDuration = (duration) => new Promise(resolve => {
  setTimeout(resolve, duration);
});


/**
 * @param {EventTarget} target The target where we're waiting for the event.
 * @param {string} eventName The name of the event we're listening for.
 * @return {Promise} A promise that will resolve with event instance the next
 *     time the named event fires on target.
 */
async.waitForEvent = (target, eventName) => new Promise(resolve => {
  const listener = (event) => {
    target.removeEventListener(eventName, listener);
    resolve(event);
  };
  target.addEventListener(eventName, listener);
});


window.async = async;


}());
