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

//default env is development
M.set('env', ( M.get('env') || 'development') );

M.set('port', ( process.env.PORT || 5000) );

M.set('dirs', {
  'hosts' : path.join(process.cwd(), 'hosts')
});

M.set('defaultHost', {
    development: 'http://localhost:' + M.get('port')
  , production : 'https://jaeh.at/'
} );

M.on('mount', function (parent) {
  autoload(M);

  U.log('M mounted');

  M.use(errorHandler);

  M.use(function(req, res, next) {
    res.redirect(M.get('defaultHost')[M.get('env')]);
  });

  M.listen(M.get('port'), function() {
    U.log( 'M listening to port:', M.get('port') );
  });
});

module.exports = M;
