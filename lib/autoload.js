'use strict';

var fs = require('fs')
  , path = require('path')
  , vhost = require('vhost')
  , log = require('magic-log')

  , skeleton = require( path.join(__dirname, 'skeleton') )
;

module.exports = function autoload(M, cb) {
  var hosts = M.get('dirs').hosts;
  log('autoload M called with dir: ', M.get('dirs').hosts);

  findHosts(M.get('dirs').hosts).forEach( function(map) {
    if ( map.dir && map.file ) {
      var p = path.join(map.dir, map.file);
      log('mounting host ', map);
      mountHost(M, require(p), map.dir);
    }
  });
  cb();
}

function mountHost(M, s, dir) {
  log('dir = ', path.join(dir, 'package.json'));
  var S = skeleton(M, s, dir)
    , hosts = require( path.join(dir, 'package.json') ).config.hosts[S.get('env')]
  ;
  log('mounting host');
  for (var subhost in hosts ) {
    M.use( vhost(hosts[subhost], S) );
    log('vhosts started for subhost ' + hosts[subhost]);
  }
}

function findHosts (dir) {
  var results = [];
  fs.readdirSync(dir).forEach( function(file) {
    var fileDir = path.join(dir, file)
      , stat = fs.statSync(fileDir)
    ;

    if ( stat && stat.isDirectory() ) {
      results = results.concat( findHosts(fileDir) );
    } else {
      if ( file.match(/H.js/) ) {
        results.push({ dir: dir, file: file });
      }
    }
  });
  return results;
}
