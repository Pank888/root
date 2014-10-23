'use strict';

var express = require('express')
  , path    = require('path')
  , handler = express()
  , log     = require( path.join(__dirname, 'log') )
;

handler.use(function(req, res, next) {
  console.log('404');
});

// development error handler
// will print stacktrace
if (handler.get('env') === 'development') {
	handler.use(function(err, req, res, next) {
    log('err with err =');
    log(err.status);
    if ( err.status === 404 ) {
      return res.redirect('/404');
    }
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
handler.use(function(err, req, res, next) {
  if ( err.status ) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  }
});

module.exports = handler;
