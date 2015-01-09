'use strict';
var express = require('express')
  , M       = express()
  , fs      = require('fs')
  , async   = require('async')
  , path    = require('path')
  , hosts   = require('magic-hosts')
  , log     = require('magic-log')
  , magic   = {}
  , env     = ( M.get('env') || 'production' )
  , cwd     = process.cwd()
  , config  = require( path.join(cwd, 'config') )
  , conf    = config.defaults[env] || false
;

magic.spawn = function(cb) {
  //default env is production
  M.set('env', env );
  log('conf.PORT', conf.PORT);

  M.set('port', ( conf.PORT || process.env.PORT || 5000) );

  log('M.get("port")', M.get('port'));

  M.set('dirs', {
    'hosts' : path.join( cwd, 'hosts' )
  } );

  log('M spawned, env = ' + M.get('env'));
  cb(null, M);
}

magic.autoload = function (M, cb) {  
  log('autoload mounts');
  hosts.mount(M, function (err, results) {
    cb(err, M);
  } );
}

magic.listen = function (M, cb) {
  M.use(function (req, res, next) {
    if ( conf.host ) {
      log('magic error handler redirecting to defaulthost:', conf.host);
      return res.redirect(conf.host);
    }
    log.warn('magic', 'final error handler, no default host found');
    //TODO: Render this as a global 404 error page, ugly but working
    res.send('final error handler. this is the end of the internet.');
  });

  M.listen( M.get('port'), function(err) {
    if ( typeof cb === 'function' ) { cb(err, M); }
  } );
}

module.exports = function init(cb) {
  async.waterfall([
      magic.spawn
    , magic.autoload
    , magic.listen
  ]
  , function (err, M) {
      if ( err ) { log.error('magic startup error:', err); }
      log.success( 'Magic listening to port:', M.get('port') );

      if ( typeof cb === 'function') {
        cb(null, M);
      }
    }
  );
}
