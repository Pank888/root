'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analytics = undefined;

var _path = require('path');

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var analytics = exports.analytics = function analytics(app) {
  var dirs = app.get('dirs');
  var name = app.get('name') || 'magic-app';
  var logDir = dirs.logs;
  var logFile = (0, _path.join)(logDir, name + '-analytics.log');

  var levels = {
    a: 0
  };

  var transports = [new _winston2.default.transports.File({
    filename: logFile,
    level: 'a',
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 50,
    colorize: false
  })];

  var logger = new _winston2.default.Logger({ transports: transports, levels: levels });

  var logHandler = function logHandler(req, res, next) {
    var ip = req.ip;
    var method = req.method;
    var path = req.path;

    logger.a('\n          Access:\n          From: ' + ip + '\n          Method: ' + method + '\n          Path: ' + path + '\n        ');

    next();
  };

  app.use('*', logHandler);
};

exports.default = analytics;
//# sourceMappingURL=analytics.js.map