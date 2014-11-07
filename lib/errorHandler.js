'use strict';

var express = require('express')
  , path    = require('path')
  , handler = express()
  , log     = require('magic-log')
;

handler.use(function(req, res, next) {
  var err = {
      status: 404
    , message: 'Page not found'
  };

  next(err, req, res, next);
});

// production error handler
// no stacktraces leaked to user
handler.use(function(err, req, res, next) {
  next(err, req, res, next);
});

module.exports = handler;
