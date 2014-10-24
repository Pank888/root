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
  }

  next(err, req, res, next);
});

// development error handler
// will print stacktrace
if (handler.get('env') === 'development') {
  handler.use(function(err, req, res, next) {
    log('err.status ' + err.status);

    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
handler.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send( 'error' );
});

module.exports = handler;
