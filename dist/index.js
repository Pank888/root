'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Magic = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _async = require('async');

var _path = require('path');

var _hosts = require('./hosts');

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
    (0, _hosts.mount)(_this.M, cb);
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