'use strict';

var fs = require('fs')
  , async = require('async')
  , path = require('path')
  , vhost = require('vhost')
  , log = require('magic-log')
  , cwd = process.cwd()

  , hostDir = path.join(cwd, 'hosts')

  , skeleton = require( path.join(__dirname, 'skeleton') )
  
  , M = null
;

function autoload(magic, cb) {
  M = magic;

  async.waterfall([
      findHosts
    , filterHosts
    , mountHosts
  ],
  cb
  )
}


function findHosts(cb) {
  var args = {};

  //log('findHosts: started');
  fs.readdir(hostDir, function (err, files) {
    if ( err ) { return cb(err); }

    args.files = files;
    cb(null, args);
  });

}

function filterHosts(args, cb) {
  async.filter(args.files, hostFilter, function (hosts) {
    args.hosts = hosts;
    cb(null, args);
  });
}

function hostFilter(file, cb) {
  var fileDir = path.join(hostDir, file, 'H.js');
  fs.exists(fileDir, function (exists) {
    cb(exists);
  });
}


function mountHosts(args, cb) {
  //log('mountHosts started, hosts: ');
  //log(args.hosts);
  
  async.map(args.hosts, hostMount, function (err, results) {
    if ( err ) { return cb(err); }

    cb(null, args);
  } );

}

function hostMount(host, cb) {
  var hostFileDir = path.join(hostDir, host)
    , hostApp = require(path.join(hostFileDir, 'H.js'))
    , S = skeleton(hostApp, hostFileDir)
    , pjson = require( path.join(hostFileDir, 'package.json') )
    , hosts = pjson.config.hosts[(S.get('env') || 'development')]
  ;

  for (var subhost in hosts ) {
    if ( hosts.hasOwnProperty(subhost) ) {
      M.use( vhost(hosts[subhost], S) );
      log('vhosts started for subhost ' + hosts[subhost]);
    }
  }
  cb(null);
}

function afterAutoload(err, args) {
  if (err) { return log(err, 'error'); }
  
  log('autoload finished without errors.');
}

module.exports = autoload;
