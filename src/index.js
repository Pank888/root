import express from 'express';
import {waterfall} from 'async';
import {join} from 'path';
import {mount} from 'magic-hosts';
import {log, success, warn} from 'magic-log';
import config from '../../config';
import {isCb} from 'magic-utils';

var self;

class Magic {
  constructor() {
    this.M = express();
    this.cwd  = process.cwd();
    if ( ! config.defaults ) {
      throw Error(`server config.js missing config.defaults key, ${config}`);
    }
    this.conf = config.defaults[process.env] || false;
    self = this;
  }

  init(cb) {
    waterfall([
        this.spawn
      , this.autoload
      , this.listen
    ]
    , err => {
        if ( err ) { error('magic startup error:', err); }
        success( 'Magic listening to port:', self.M.get('port') );

        if ( isCb(cb) ) {
          cb(null);
        }
      }
    );
  }
  spawn(cb) {
    //executes before hosts
    self.M.set('env', self.env );
    log('conf.PORT', self.conf.PORT);

    self.M.set('port', ( self.conf.PORT || process.env.PORT || 5000) );

    log(`self.M.get("port"): ${self.M.get('port')}`);

    self.M.set('dirs', {
      'hosts' : join( self.cwd, 'hosts' )
    });

    log(`self.M spawned, env = ${self.M.get('env')}`);
    cb(null);
  }

  autoload(cb) {
    //proxies to the various hosts (vhost for now, node proxy tbd)
    log('autoload mounts');
    mount(self.M, (err, results) => {
      if ( isCb(cb) ) {
        cb(err);
      }
    } );
  }

  listen(cb) {
    //gets executed after all hosts executed
    self.M.use( (req, res, next) => {
      if ( self.conf.host ) {
        log('magic error handler redirecting to defaulthost:', self.conf.host);
        return res.redirect(self.conf.host);
      }
      warn('magic', 'final error handler, no default host found');
      //TODO: Render this as a global 404 error page, ugly but working
      res.send('final error handler. this is the end of this part of the internet.');
    });

    self.M.listen( self.M.get('port'), err => {
      if ( isCb(cb) ) { cb(err); }
    });
  }
}

export default Magic;
