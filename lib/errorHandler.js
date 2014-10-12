'use strict';

var express = require('express')
	, path = require('path')
	, errorHandler = express()
;

// catch 404 and forward to error handler
errorHandler.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (errorHandler.get('env') === 'development') {
	errorHandler.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
errorHandler.use(function(err, req, res, next) {
	if ( err.status ) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	} else {
		next();
	}
});

module.exports = errorHandler;
