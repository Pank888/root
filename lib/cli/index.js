#!/usr/bin/env node
'use strict';

var fs = require('fs')
  , path = require('path')
  , inquirer = require('inquirer')
  
  , log = require( path.join(__dirname, 'log') )
  , host = require( path.join(__dirname, 'host') )

  , cli = {}
;

cli.init = function(M) {
  log.log('cli init called');
  cli.M = M;
}

cli.promptForAction = function promptForAction(cmd) {
  console.log('What do you want to do?');

  var promptArgs = [
    {
        name   : 'action'
      , message: 'Choose an Action'
      , type   : 'list'
      , choices: [
          {
            name : 'add Host'
          , value: 'addHost'
        }
        , {
            name : 'update Host'
          , value: 'updateHost'
        }
        , {
            name : 'update all Hosts'
          , value: 'updateAllHosts'
        }
        , {
            name : 'remove Host'
          , value: 'removeHost'
        }
      ]
    }
  ];
  
  inquirer.prompt(promptArgs, function(args) {
    if (args.action === 'addHost') {
      host.add();
    } else if ( args.action === 'updateHost' ) {
      host.update();
    } else if ( args.action === 'updateAll') {
      host.updateAll();
    } else if ( args.action === 'removeHost' ) {
      host.remove();
    }
  });
}

cli.host = host;

module.exports = cli;
