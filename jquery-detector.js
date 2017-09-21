/*
 * Simple phantomjs script to detect if a website is running jquery
 */
"use strict";

var system = require('system');

function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 750, //< Default Max Timout is 750ms
    start = new Date().getTime(),
    condition = false,
    interval = setInterval(function() {
      if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
        // If not time-out yet and condition not yet fulfilled
        condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
      } else {
        if (!condition) {
          // If condition still not fulfilled (timeout but condition is 'false')
          console.log("No jQuery");
          phantom.exit(1);
          return;
        }

        // Condition fulfilled (timeout and/or condition is 'true')
        typeof(onReady) === "string" ? eval(onReady): onReady(); //< Do what it's supposed to do once the condition is fulfilled
        clearInterval(interval); //< Stop this interval
      }
    }, 250); //< repeat check every 250ms
};

function checkForJQuery(url, timeOutMillis) {
  var page = require('webpage').create();

  page.open(url, function(status) {
    if (status !== "success") {
      console.log("Unable to access network");
      phantom.exit(1);
      return;
    }

    var jQuery = waitFor(function() {
      // Check in the page if a specific element is now visible
      return page.evaluate(function() {
        return typeof jQuery !== 'undefined' || typeof $ !== 'undefined';
      });
    }, function() {
      var jqueryVersion = page.evaluate(function() {
        var jq = jQuery || $;
        if (typeof jq === 'function' || typeof jq === 'object') {
          return jq.fn ? (jq.fn.jquery ? jq.fn.jquery : "No jQuery") : "No jQuery";
        } else {
          return "No jQuery"
        }
      })

      console.log('jQuery', jqueryVersion);

      phantom.exit();
    }, timeOutMillis);
  });
}

if (system.args.length < 2) {
  console.log(system.args[0] + ' ' + '<url>');
} else {
  checkForJQuery(system.args[1], system.args[2]);
}
