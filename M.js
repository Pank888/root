'use strict';

var express = require('express')
  , fs      = require('fs')
  , async   = require('async')
  , vhost   = require('vhost')
  , path    = require('path')
  , hosts   = require('magic-hosts')
  , log     = require('magic-log')
  , menu    = require('magic-menu')
  , config  = require( path.join(process.cwd(), 'config') )
  , magic   = {}
;

magic.spawn = function(cb) {
  var M = express();

  //default env is development
  M.set('env', ( M.get('env') || 'development' ) );

  M.set('port', ( process.env.PORT || 5000) );

  M.set('dirs', {
    'hosts' : path.join( process.cwd(), 'hosts' )
  } );

  log('M spawned, env = ' + M.get('env'));
  cb(null, M);
}

magic.autoload = function (M, cb) {  
  log('autoload mounts');
  hosts.mount(M, function (err, results) {
    log(results);
    cb(err, M);
  } );
}

magic.listen = function (M, cb) {
  M.listen( M.get('port'), function() {
    log( 'M listening to port:' + M.get('port') );

    if ( typeof cb === 'function' ) {
      cb(null, M);
    }
  } );
}

magic.done = function (err, M) {
  if ( err ) { return log(err, 'error'); }
  log('Magic started.');
  
  if ( typeof cb === 'function') {
    cb(null, M);
  }
}

module.exports = function init(cb) {
  async.waterfall([
      magic.spawn
    , magic.autoload
    , magic.listen
  ],
    magic.done
  );
}
