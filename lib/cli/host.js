'use strict';

var fs       = require('fs')
  , path     = require('path')
  , inquirer = require('inquirer')
  , rimraf   = require('rimraf')
  , async    = require('async')
  , exec     = require('child_process').exec
  , cwd      = process.cwd()
  , log      = require(path.join(__dirname, 'log'))
  , git      = require(path.join(__dirname, 'git'))
  , host     = {}
;

host.exists = function(name) {
  if ( ! name || typeof name !== 'string' ) {
    return log.error('Please specify a name');
  }

  log.log('Search Host by name: ' + name);
  return fs.existsSync( path.join(process.cwd(), 'hosts', name) );
}

host.add = function() {
  async.waterfall( 
    [
      getHostname
    , getGitProvider
    , getGitUrl
    , getGitUser
    , getGitRepository
    , git.submodule.add
    ]
    , git.submodule.added
  );
}

host.update = function() {
  //git submodule update hosts/hostname
  chooseHost(function(hostname) {
    log.log('Updating: ' + hostname);
    if ( ! host.exists(hostname) ) {
      return log.error('Host does not exist');
    }
    
//    exec(
//      'git pull '
//    );
    
  } );
}

host.updateAll = function() {
  //git submodule update --init --recursive
  log.log('Update all Hosts');
}

host.remove = function () {
  async.waterfall(
    [
        readHostsDir
      , findHosts
      , chooseHost
      , getConfirmation
      , git.submodule.deinit
      , git.submodule.rm
      , rmHost
    ]
    , git.submodule.removed
  );
}

function getHostname(cb) {
  log.log('Please specify a name for the new host:');
  inquirer.prompt({
      name: 'hostname'
    , message: 'Hostname: '
  }, function(input) {
    if ( ! input || ! input.hostname ){
      return cb('Hostname can not be empty');
    }
    cb(null, {hostname: input.hostname});
  } );
}

function getGitProvider(args, cb) {
  inquirer.prompt({
      name: 'gitProvider'
    , type: 'list'
    , message: 'Choose your git provider:'
    , choices: [
        { name: 'git@github.com:' }
      , { name: 'https://github.com/' }
      , { name: 'git@bitbucket.org:' }
      , { name: 'https://bitbucket.org/'}
      , { name: 'custom'}
    ],
  }
  , function(input) {
    if ( ! input || ! input.gitProvider ) {
      return cb('Git Provider can not be empty');
    }
    args.gitProvider = input.gitProvider;

    cb(null, args);
  } );
}

function getGitUrl(args, cb) {
  if ( args.gitProvider !== 'custom' ) {
    return cb(null, args);
  }

  inquirer.prompt( {
      name: 'gitUrl'
    , message: 'Please input the full url to your repository'
  }
  , function(input) {
    if ( ! input || ! input.gitUrl ) {
      return cb(null, args);
    }
    args.gitUrl = input.gitUrl;
    cb(null, args);
  } );

}


function getGitUser(args, cb) {
  if ( args.gitUrl ) { return cb(null, args); }

  inquirer.prompt({
      name: 'gitUser'
    , message: 'Your git username:'
  }
  , function(input) {
    if ( ! input || ! input.gitUser ) {
      return cb('getGitUser failed: Git User can not be empty');
    }
    args.gitUser = input.gitUser;
    cb(null, args);
  } );
}

function getGitRepository(args, cb) {
  if ( args.gitUrl ) { return cb(null, args); }

  inquirer.prompt({
      name: 'gitRepository'
    , message: 'The git repository to clone from:'
  }
  , function(input) {
    if ( ! input || ! input.gitRepository ) {
      return cb('getGitRepository failed: Git Repository can not be empty');
    }
    args.gitRepository = input.gitRepository;
    cb(null, args);
  } );
}

function getConfirmation(args, cb) {
  inquirer.prompt( {
      name: 'confirm'
    , type: 'confirm'
    , message: args.message || 'Confirm: '
    , default: false
  }, function (input) {
    args.confirm = ( input.confirm === true );
    cb(null, args);
  });
}

function chooseHost(args, cb) {
  inquirer.prompt({
      name: 'hostname'
    , message: 'Which host do you want to remove?'
    , type: 'list'
    , choices: args.hosts
  }, function (input) {
    if ( ! input || ! input.hostname) {
      return cb('chooseHost failed: Need Hostname')
    }
    args.hostname = input.hostname;
    cb(null, args);
  } );
}

function readHostsDir(cb) {
  var args = {};

  fs.readdir(path.join(cwd, 'hosts'), function (err, files) {
    if ( err ) {
      return cb(err);
    }
    args.files = files;
    cb(err, args);
  } );
}

function findHosts(args, cb) {
  args.hosts = [];

  async.map(args.files, filterHosts, function(err, hosts) {
    args.hosts = hosts;
    cb(null, args);
  } );
}

function filterHosts(file, cb) {
  var filePath = path.join(cwd, 'hosts', file);
  console.log('filterHosts file = ' + file);
  fs.stat(filePath, function (err, stats) {
    if ( err ) { return log.error(err); }
    if ( stats.isDirectory() ) {
      fs.exists(path.join(filePath, 'package.json'), function (exists) {
        if ( exists ) { 
          cb(null, file);
        } else {
          cb(null, null);
        }
      } );
    } else {
      cb(null, null);
    }
  } );
}

function rmHost(args, cb) {
  console.log('rmhost args = ' + args);
  var hostPath = path.join(cwd, 'hosts', args.hostname);

  rimraf(hostPath, function (err) {
    cb(err, args);
  });
}


function deinitSubmodule(args, cb) {
  if ( ! args || ! args.hostname ) {
    return cb('deinitSubmodule failed: Need hostname');
  }
  
  var cmd = 'git submodule deinit ' + args.hostname;
  exec(cmd, function(err, stdout, stderr) {
    if ( err ) { return cb(err); }
    if ( stderr ) { return cb(stderr); } 
    
    cb(null, args);
  } );
}

module.exports = host;
