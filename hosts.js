'use strict';

var fs          = require('fs')
  , async       = require('async')
  , path        = require('path')
  , vhost       = require('vhost')
  , log         = require('magic-log')
  , skeleton    = require('magic-skeleton')
  , cwd         = process.cwd()
  , hostRootDir = path.join(cwd, 'hosts')
  , M = null
;

exports.mount = function autoload(magic, cb) {
  M = magic;

  async.waterfall([
      exports.findHosts
    , mountHosts
  ], cb);
}


exports.findHosts = function findHosts(cb) {
  var args = {};

  fs.readdir(hostRootDir, function (err, files) {
    async.filter(files, hostFilter, function (hosts) {
      args.hosts = hosts;
      cb(err, args);
    });
  });
}

function hostFilter(file, cb) {
  var fileDir = path.join(hostRootDir, file, 'H.js');
  fs.exists(fileDir, function (exists) {
    cb(exists);
  });
}

function mountHosts(args, cb) {
  async.map(
      args.hosts
    , function hostMount(host, cb) {
        var hostDir = path.join(hostRootDir, host)
          , hostApp = require(path.join(hostDir, 'H.js'))
          , S       = skeleton(hostApp, hostDir)
          , config  = require( path.join(hostDir, 'config') )
          , hosts   = ( config.hosts ? config.hosts[(S.get('env') || 'development')] : [] )
        ;

        if ( ! hosts ) { return cb('config.js needs an attribute named hosts.'); }

        hosts.forEach( function (host) {
          M.use( vhost(host, S) );
          log('vhosts started for subhost ' + host);
        } );

        cb(null);
      }
    , function (err) {
      if ( typeof cb === 'function' ) {
        cb(err, args);
      }
    } 
  );
}



