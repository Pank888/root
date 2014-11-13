'use strict';
var express = require('express')
  , M       = express()
  , fs      = require('fs')
  , async   = require('async')
  , path    = require('path')
  , hosts   = require('magic-hosts')
  , log     = require('magic-log')
  , db      = require('magic-db')
  , auth    = require('magic-auth')
  , users   = require('magic-users')
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
    let schema = db(conf.db);
    M.set('schema', schema);
    
    M.use( function(req, res, next) {
      //creates the user database models
      users.init(schema, next);
      auth.init(schema, next);
    } );
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
      res.redirect(conf.host);
    }
  });
  
  M.listen( M.get('port'), function() {
    if ( typeof cb === 'function' ) { cb(null, M); }
  } );
}

module.exports = function init(cb) {
  async.waterfall([
      magic.spawn
    , magic.autoload
    , magic.listen
  ]
  , function (err, M) {
      if ( err ) { log(err, 'error'); }
      log( 'Magic listening to port:' + M.get('port') );

      if ( typeof cb === 'function') {
        cb(null, M);
      }
    }
  );
}

