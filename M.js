'use strict';

var express      = require('express')
  , fs           = require('fs')
  , async        = require('async')
  , vhost        = require('vhost')
  , path         = require('path')
  , lib          = path.join(__dirname, 'lib')
  , autoload     = require( path.join(lib, 'autoload') )
  , errorHandler = require( path.join(lib, 'errorHandler') )
  , log          = require('magic-log')

  , magic        = {}
;

function init(cb) {
  async.waterfall([
      magic.spawn
    , magic.autoload
    , magic.finish
  ],
    magic.done
  );
}

magic.spawn = function(cb) {
  var M = express();
  
  //default env is development
  M.set('env', ( M.get('env') || 'development' ) );

  M.set('port', ( process.env.PORT || 5000) );

  M.set('dirs', {
    'hosts' : path.join( process.cwd(), 'hosts' )
  } );

  M.set('defaultHost', {
      development: 'http://jaeh.test:' + M.get('port')
    , production : 'https://jaeh.at/'
  } );

  log('M spawned, env = ' + M.get('env'));
  cb(null, M);
}

magic.autoload = function (M, cb) {  
  autoload(M, function (err, results) {
    log(results);
    cb(err, M);
  } );
}

magic.finish = function (M, cb) {
  M.use(errorHandler);

  M.use( function(err, req, res, next) {
    res.redirect(M.get('defaultHost')[M.get('env')]);
  } );

  M.listen( M.get('port'), function() {
    log( 'M listening to port:' + M.get('port') );
  
    if ( typeof cb === 'function' ) {
      cb(null, M);
    }
  } );
}

magic.done = function (err, M) {
  if ( err ) { return log(err, 'error'); }
  log('Magic done.');
  
  if ( typeof cb === 'function') {
    cb(null, M);
  }
}

module.exports = init;
