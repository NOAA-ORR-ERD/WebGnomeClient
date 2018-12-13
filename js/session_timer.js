// This is intended to be run as a web worker

setInterval(function() { postMessage('tick'); }, 1000);
