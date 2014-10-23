'use strict';

var color = require('bash-color')
  , verbose = true
;

exports.error = function(str) {
  if ( str ) { console.log(color.red(str)); }
}

exports.log = function(str, v) {
  if ( ( verbose || v ) && str) { console.log(str); }
}

exports.success = function (str) {
  if ( str ) { console.log(color.green(str)); }
}
