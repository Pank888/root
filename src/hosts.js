import { readdir, exists } from 'fs';
import { waterfall, filter, map } from 'async';
import { join } from 'path';
import vhost from 'vhost';
import { log } from 'magic-server-log';
import skeleton from './skeleton';

const cwd = process.cwd();
const hostRootDir = join(cwd, 'hosts');
let M = null;

const noop = () => {};

export const mount =
  (magic, cb = noop) => {
    M = magic;

    waterfall([
      findHosts,
      mountHosts,
    ], cb);
  };

export const findHosts =
  (cb = noop) => {
    const args = {};

    readdir(
      hostRootDir,
      (err, files) => {
        filter(
          files,
          hostFilter,
          hosts => {
            args.hosts = hosts;
            cb(err, args);
          }
        );
      }
    );
  };

const hostFilter =
  (file, cb = noop) => {
    const fileDir = join(hostRootDir, file, 'H.js');
    exists(fileDir, exists => {
      cb(exists);
    });
  };

const mountHosts =
  (args, cb = noop) => {
    map(args.hosts, mountHost, err => {
      cb(err, args);
    });
  };

const mountHost =
  (host, cb = noop) => {
    log('host', host);
    const hostDir = join(hostRootDir, host);
    const hostApp = require(join(hostDir, 'H.js'));
    const skel = skeleton(M, hostApp, hostDir);
    const config = require(join(hostDir, 'config'));
    const env = (skel.get('env') || 'production');
    const hosts = (config.hosts[env] ? config.hosts[env] : []);

    if (!hosts) {
      return cb('config.js needs an attribute named hosts.');
    }

    hosts.forEach(
      host => {
        M.use(vhost(host, skel));
        log('vhosts started for subhost ' + host);
      });

    cb(null);
  };
