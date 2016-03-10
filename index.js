'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findHosts = exports.mount = undefined;

var _fs = require('fs');

var _async = require('async');

var _path = require('path');

var _vhost = require('vhost');

var _vhost2 = _interopRequireDefault(_vhost);

var _magicLog = require('magic-log');

var _magicSkeleton = require('magic-skeleton');

var _magicSkeleton2 = _interopRequireDefault(_magicSkeleton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();
var hostRootDir = (0, _path.join)(cwd, 'hosts');
var M = null;

var noop = function noop() {};

var mount = exports.mount = function mount(magic) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  M = magic;

  (0, _async.waterfall)([findHosts, mountHosts], cb);
};

var findHosts = exports.findHosts = function findHosts() {
  var cb = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

  var args = {};

  (0, _fs.readdir)(hostRootDir, function (err, files) {
    (0, _async.filter)(files, hostFilter, function (hosts) {
      args.hosts = hosts;
      cb(err, args);
    });
  });
};

var hostFilter = function hostFilter(file) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  var fileDir = (0, _path.join)(hostRootDir, file, 'H.js');
  (0, _fs.exists)(fileDir, function (exists) {
    cb(exists);
  });
};

var mountHosts = function mountHosts(args) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  (0, _async.map)(args.hosts, mountHost, function (err) {
    cb(err, args);
  });
};

var mountHost = function mountHost(host) {
  var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

  (0, _magicLog.log)('host', host);
  var hostDir = (0, _path.join)(hostRootDir, host);
  var hostApp = require((0, _path.join)(hostDir, 'H.js'));
  var skel = (0, _magicSkeleton2.default)(M, hostApp, hostDir);
  var config = require((0, _path.join)(hostDir, 'config'));
  var env = skel.get('env') || 'production';
  var hosts = config.hosts[env] ? config.hosts[env] : [];

  if (!hosts) {
    return cb('config.js needs an attribute named hosts.');
  }

  hosts.forEach(function (host) {
    M.use((0, _vhost2.default)(host, skel));
    (0, _magicLog.log)('vhosts started for subhost ' + host);
  });

  cb(null);
};

//# sourceMappingURL=index.js.map