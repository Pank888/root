import express from 'express';
import { waterfall } from 'async';
import { join } from 'path';
import { mount } from './hosts';
import log from 'magic-server-log';

const noop = () => {};

export class Magic {
  constructor =
    config => {
      this.M = express();
      this.cwd = process.cwd();

      if (!config.defaults) {
        throw new Error(`server config.js missing config.defaults key, ${config}`);
      }

      this.conf = config.defaults[process.env] || false;
    };

  init =
    (cb = noop) => {
      const { spawn, autoload, listen } = this;
      waterfall(
        [spawn, autoload, listen],
        err => {
          if (err) {
            log.error('magic startup error:', err);
            return cb(err);
          }

          log.success('Magic listening to port:', this.M.get('port'));

          cb(null);
        }
      );
    };

  spawn =
    (cb = noop) => {
    // executes before hosts
      this.M.set('env', this.env);
      log('conf.PORT', this.conf.PORT);

      this.M.set('port', (this.conf.PORT || process.env.PORT || 5000));

      log(`this.M.get("port"): ${this.M.get('port')}`);

      this.M.set('dirs', {
        'hosts': join(this.cwd, 'hosts'),
      });

      log(`this.M spawned, env = ${this.M.get('env')}`);
      cb(null);
    };

  autoload =
    (cb = noop) => {
      // proxies to the various hosts (vhost for now, node proxy tbd)
      log('autoload mounts');
      mount(this.M, cb);
    };

  listen =
    (cb = noop) => {
      const port = this.M.get('port');

      // gets executed after all hosts executed
      this.M.use(
        (req, res, next) => {
          const { host } = this.conf;

          if (host) {
            log('magic error handler redirecting to defaulthost:', host);
            return res.redirect(host);
          }

          log.warn('magic', 'final error handler, no default host found');
          // TODO: Render this as a global 404 error page, ugly but working
          res.send('final error handler. this is the end of the internet.');
        }
      );

      this.M.listen(port, cb);
    };
}

export default Magic;
