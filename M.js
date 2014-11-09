'use strict';
var express = require('express')
  , M       = express()
  , fs      = require('fs')
  , async   = require('async')
  , path    = require('path')
  , hosts   = require('magic-hosts')
  , log     = require('magic-log')
  , db      = require('magic-db')
  , magic   = {}
  , env     = ( M.get('env') || 'production' )
  , cwd     = process.cwd()
  , config  = require( path.join(cwd, 'config') )
  , conf    = config.defaults[env] || false
;

magic.spawn = function(cb) {
  //default env is production
  M.set('env', env );

  M.set('port', ( process.env.PORT || 5000) );

  M.set('dirs', {
    'hosts' : path.join( cwd, 'hosts' )
  } );

  if ( conf && conf.db ) {
    M.set('db', config.defaults[env].db );
  }

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
  M.use(function (req, res, next) {
    if ( conf.host ) {
      res.redirect(defHost);
    }
  });
  
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
