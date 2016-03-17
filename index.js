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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Magic = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _async = require('async');

var _path = require('path');

var _magicHosts = require('magic-hosts');

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var noop = function noop() {};

var Magic = exports.Magic = function Magic() {
  var _this = this;

  _classCallCheck(this, Magic);

  this.constructor = function (config) {
    _this.M = (0, _express2.default)();
    _this.cwd = process.cwd();

    if (!config.defaults) {
      throw new Error('server config.js missing config.defaults key, ' + config);
    }

    _this.conf = config.defaults[process.env] || false;
  };

  this.init = function () {
    var cb = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];
    var spawn = _this.spawn;
    var autoload = _this.autoload;
    var listen = _this.listen;

    (0, _async.waterfall)([spawn, autoload, listen], function (err) {
      if (err) {
        _magicServerLog2.default.error('magic startup error:', err);
        return cb(err);
      }

      _magicServerLog2.default.success('Magic listening to port:', _this.M.get('port'));

      cb(null);
    });
  };

  this.spawn = function () {
    var cb = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    // executes before hosts
    _this.M.set('env', _this.env);
    (0, _magicServerLog2.default)('conf.PORT', _this.conf.PORT);

    _this.M.set('port', _this.conf.PORT || process.env.PORT || 5000);

    (0, _magicServerLog2.default)('this.M.get("port"): ' + _this.M.get('port'));

    _this.M.set('dirs', {
      'hosts': (0, _path.join)(_this.cwd, 'hosts')
    });

    (0, _magicServerLog2.default)('this.M spawned, env = ' + _this.M.get('env'));
    cb(null);
  };

  this.autoload = function () {
    var cb = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    // proxies to the various hosts (vhost for now, node proxy tbd)
    (0, _magicServerLog2.default)('autoload mounts');
    (0, _magicHosts.mount)(_this.M, cb);
  };

  this.listen = function () {
    var cb = arguments.length <= 0 || arguments[0] === undefined ? noop : arguments[0];

    var port = _this.M.get('port');

    // gets executed after all hosts executed
    _this.M.use(function (req, res, next) {
      var host = _this.conf.host;


      if (host) {
        (0, _magicServerLog2.default)('magic error handler redirecting to defaulthost:', host);
        return res.redirect(host);
      }

      _magicServerLog2.default.warn('magic', 'final error handler, no default host found');
      // TODO: Render this as a global 404 error page, ugly but working
      res.send('final error handler. this is the end of the internet.');
    });

    _this.M.listen(port, cb);
  };
};

exports.default = Magic;

//# sourceMappingURL=index.js.map