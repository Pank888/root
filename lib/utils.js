'use strict';

var express = require('express')
	, app = express()
	, is_dev = app.get('env') === 'development'
;

exports.log = function Ulog(code, message) {
	if ( is_dev ) {
		var returnString = '';

		if (typeof code !== 'undefined') {
			if ( typeof code === 'array' || typeof code === 'object') {
				//console.log('code: ');
				console.log( code );
			} else {
				returnString += code + ' ';
			}
		}
		if (typeof message !== 'undefined') {
			if ( typeof message === 'array' || typeof message === 'object') {
				if (returnString) {
					console.log(returnString);
					returnString = '';
				}
				//console.log( 'message: ' );
				console.log( message );
			} else {
				returnString += message;
			}
		}
		if ( returnString ) {
			console.log(returnString);
		}
	}
}


exports.render = function renderRoute( req, res, next ) {
	var template = ( req.params.page || 'index' );

	res.render(template, {}, function(err, html) {
		if ( err || ! html ) {
			next();
		} else {
			res.end(html);
		}
	});
}
