'use strict';

var express = require('express')
	, fs = require('fs')
	, vhost = require('vhost')
	, path = require('path')

	, lib = path.join(__dirname, 'lib')

	, autoload = require( path.join(lib, 'autoload') )
	, errorHandler = require( path.join(lib, 'errorHandler') )
	, U = require( path.join(lib, 'utils'))

	, M = express()
;

M.set('port', ( process.env.PORT || 3000) );

M.set('dirs', {
	'hosts' : path.join(process.cwd(), 'hosts')
});

M.set('defaultHost', {
		development: 'http://localhost:' + M.get('port')
	,	production : 'https://jaeh.at/'
} );

autoload(M);

M.on('mount', function (parent) {

	U.log('mounting M.');

	M.use(errorHandler);

	M.use(function(req, res, next) {
		res.redirect(M.get('defaultHost')[M.get('env')]);
	});

	M.listen(M.get('port'));
});

module.exports = M;
