// This basically counts the elapsed seconds for the application
//
// This is intended to be run as a web worker.
// The reason for this is because the application runtime gets deprioritized
// when the active browser tab is switched to something else, and the interval
// counter would stop counting.  Web workers do not suffer from this however.

setInterval(function() { postMessage('tick'); }, 60 * 1000);
