'use strict';

var fs          = require('fs')
  , async       = require('async')
  , path        = require('path')
  , vhost       = require('vhost')
  , log         = require('magic-log')
  , hostRootDir = path.join(process.cwd(), 'hosts')
  , skeleton    = require( path.join(__dirname, 'skeleton') )
  , M = null
;

function autoload(magic, cb) {
  M = magic;

  async.waterfall([
      findHosts
    , filterHosts
    , mountHosts
  ], cb);
}


function findHosts(cb) {
  var args = {};

  fs.readdir(hostRootDir, function (err, files) {
    args.files = files;
    cb(err, args);
  });
}

function filterHosts(args, cb) {
  async.filter(args.files, hostFilter, function (hosts) {
    args.hosts = hosts;
    cb(null, args);
  });
}

function hostFilter(file, cb) {
  var fileDir = path.join(hostRootDir, file, 'H.js');
  fs.exists(fileDir, function (exists) {
    cb(exists);
  });
}

function mountHosts(args, cb) {  
  async.map(args.hosts, mountHost, function (err) {
    cb(err, args);
  } );
}

function mountHost(host, cb) {
  var hostDir = path.join(hostRootDir, host)
    , hostApp = require(path.join(hostDir, 'H.js') )
    , S       = skeleton(hostApp, hostDir)
    , config  = require( path.join(hostDir, 'config') )
    , env     = ( S.get('env') || 'development')
    , hosts   = ( config.hosts ? config.hosts[env] : [] )
  ;

  if ( ! hosts ) { return cb('hosts settings missing in config.js'); }

  hosts.forEach( function (host) {
    M.use( vhost(host, S) );
    log('vhosts started for subhost ' + host);
  } );

  cb(null);
}

module.exports = autoload;
