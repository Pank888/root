'use strict';

var express = require('express')
	, app = express()
	, is_dev = app.get('env') === 'development'
;

module.exports = function Mlog(code, message) {
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
