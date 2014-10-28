'use strict';

var fs       = require('fs')
  , async    = require('async')
  , path     = require('path')
  , jade     = require('jade')
  , vhost    = require('vhost')
  , log      = require('magic-log')
  , cwd      = process.cwd()
  , hostDir  = path.join(cwd, 'hosts')
  , skeleton = require( path.join(__dirname, 'skeleton') )
  , M = null
;

function autoload(magic, cb) {
  M = magic;
  async.waterfall([
      findHosts
    , filterHosts
    , mountHosts
    , getHostMeta
  ],
  cb
  )
}

function findHosts(cb) {
  var args = {}
    , hostDir = M.get('dirs').hosts

  //log('findHosts: started');
  fs.readdir(hostDir, function (err, files) {
    if ( err ) { return cb(err); }

    args.hosts = files;
    cb(null, args);
  });

}

function filterHosts(args, cb) {
  async.filter(args.hosts, hostFilter, function (hosts) {
    args.hosts = hosts;
    cb(null, args);
  });
}

function hostFilter(file, cb) {
  var hostdir = M.get('dirs').hosts
    , fileDir = path.join(hostDir, file, 'H.js');
  fs.exists(fileDir, function (exists) {
    cb(exists);
  });
}

function mountHosts(args, cb) {
  async.map(args.hosts, hostMount, function (err, hosts) {
    args.hosts = hosts;
    cb(err, args);
  } );
}

function hostMount(host, cb) {
  var hostFileDir = path.join(hostDir, host)
    , S           = require(path.join(hostFileDir, 'H.js'))
    , pjson       = require( path.join(hostFileDir, 'package.json') )
    , hosts       = pjson.config.hosts[(S.get('env') || 'development')]
  ;

  S.set('homeDir', hostFileDir);

  hosts.forEach(function (h) {
    M.use( vhost( h, skeleton(S) ) );
    log('vhosts started for subhost ' + h);
  } );

  cb(null, S);
}

function getHostMeta(args, cb) {
  async.each(
    args.hosts, 
    function (host, callback) {
      getPages(host, function (err, pages) {
        host.set('pages', pages);
        callback(err, pages);
      } );
    },
    function (err, pageMeta) {
      log('get pages done');
      cb(err);
    }
  );
}

function getPages(S, cb) {
  async.waterfall([
      function prepare(cb) {
        var args = {
          viewDir: path.join(S.get('views'), 'pages')
        };
        cb(null, args);
      }
    , findPages
    , compilePages
  ],
  function (err, args) {
    log(err, 'error');
    if ( ! args || ! args.pages ) { return cb('No pages found for host'); }

    cb(err, args.pages);
  } );
}

function findPages(args, cb) {
  fs.readdir(args.viewDir, function (err, pageFiles) {
    args.pageFiles = pageFiles;
    cb(null, args)
  } );
}

function compilePages(args, cb) {
  args.pages = {};

  async.each(
    args.pageFiles, 
    function (page, callback) {
      var pageName = page.replace('.jade', '');
      args.pages[pageName] = renderTemplate(path.join(args.viewDir, page));
      callback(null);
    }, 
    function (err) {
      log(err, 'error');
      cb(null, args);
    }
  );
}

function renderTemplate(template, cb) {
  return jade.renderFile(template);
}

module.exports = autoload;
