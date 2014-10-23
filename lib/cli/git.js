'use strict';

var path = require('path')
  , exec = require('child_process').exec
  , log  = require(path.join(__dirname, 'log') )
  , cwd  = process.cwd()
  , git  = {
      submodule: {}
  }
;


git.commit = function (args, cb) {
  var host = args.hostname
    , hostPath = path.join(cwd, 'hosts', host)
    , cmd = 'git commit -m "' + args.msg + '" ' + hostPath
  ;

  exec(cmd, function (err, stdout, stderr) {
    if (err) { return }
  });
}

git.submodule.add = function (args, cb) {
  var host = args.hostname
    , prov = args.gitProvider
    , user = args.gitUser
    , repo = args.gitRepository
    , url  = args.gitUrl || prov + user + '/' + repo
    , cmd  = 'git submodule add -b master --force ' + url + ' ' + host
    , opt  = { cwd: path.join(cwd, 'hosts') }
  ;

  log.log('addHost exec: ' + cmd);

  exec( cmd, opt, function (err, stdout, stderr) {
    err = err || stderr;

    if ( err ) { return cb(err); }

    if ( stdout ) { log.log(stdout); }
    
    args.success = true;
    cb(err, args);    
  });
  
}

git.submodule.added = function (err, args) {
  var msg = 'Add host ';
  if ( err ) { return log.error(err); }

  if ( ! args || ! args.success ) { 
    log.error(msg + 'failed');
  } else { 
    log.success(msg + 'succeeded');
  }
}


git.submodule.deinit = function (args, cb) {
  var host = args.hostname
    , cmd  = 'git submodule deinit ' + host
  ;

  exec(cmd, function (err, stdout, stderr) {
    if ( err ) { return cb(err); }
    if ( stdout ) { log.log(stdout); }
    if ( stderr ) { return cb(err); }
    
    cb(null, args);
  })
}

git.submodule.rm = function (args, cb) {
  var hostPath = path.join(cwd, 'hosts', args.hostname)
    , cmd = 'git rm ' + hostPath
  ;
  exec(cmd, function (err, stdout, stderr) {
    if ( err ) { return cb(err); }
    if ( stdout ) { log.log(stdout); }
    if ( stderr ) { return cb(stderr); }

    cb(null, args);
  });
}


git.submodule.removed = function (err, args) {
  if ( err) { return log.error(err); }

  console.log('args = ' + args);
  log.log('host removed');
}


module.exports = git;
