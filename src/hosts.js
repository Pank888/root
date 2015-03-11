'use strict';
import {readdir, exists} from 'fs';
import {waterfall, filter, map} from 'async';
import {join} from 'path';
import vhost from 'vhost';
import {log} from 'magic-log';
import skeleton from 'magic-skeleton';


var cwd         = process.cwd()
  , hostRootDir = join(cwd, 'hosts')
  , M = null
  , host = {}
;

export function mount(magic, cb) {
  M = magic;

  waterfall([
    findHosts
  , mountHosts
  ], cb);
}

export function findHosts(cb) {
  var args = {};

  readdir(hostRootDir, (err, files) => {
    filter(files, hostFilter, hosts => {
      args.hosts = hosts;
      cb(err, args);
    });
  });
}

function hostFilter(file, cb) {
  var fileDir = join(hostRootDir, file, 'H.js');
  exists(fileDir, exists => {
    cb(exists);
  });
}

function mountHosts(args, cb) {
  map( args.hosts, mountHost, err => {
    if ( typeof cb === 'function' ) {
      cb(err, args);
    }
  });
}

function mountHost(host, cb) {
  log('host', host);
  var hostDir = join(hostRootDir, host)
    , hostApp = require(join(hostDir, 'H.js'))
    , skel    = skeleton(M, hostApp, hostDir)
    , config  = require( join(hostDir, 'config') )
    , env     = ( skel.get('env') || 'production' )
    , hosts   = ( config.hosts[env] ? config.hosts[env] : [] )
  ;

  if ( ! hosts ) { return cb('config.js needs an attribute named hosts.'); }

  hosts.forEach( function (host) {
    M.use( vhost(host, skel) );
    log('vhosts started for subhost ' + host);
  } );

  cb(null);
}
