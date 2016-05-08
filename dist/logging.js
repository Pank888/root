'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initiateLogging = undefined;

var _path = require('path');

var _expressErrorHandler = require('express-error-handler');

var _expressErrorHandler2 = _interopRequireDefault(_expressErrorHandler);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_winston2.default.emitErrs = true;

var initiateLogging = exports.initiateLogging = function initiateLogging(app) {
  var dirs = app.get('dirs');
  var env = app.get('env');
  var name = app.get('name') || 'magic-app';
  var logDir = dirs.logs || (0, _path.join)(__dirname, '..', 'logs');
  var logFile = app.get('logFile') || (0, _path.join)(logDir, name + '-access.log');

  var errorHandlerOptions = env === 'development' ? { dumpExceptions: true, showStack: true } : {};

  app.use((0, _expressErrorHandler2.default)(errorHandlerOptions));

  var level = env === 'development' ? 'debug' : 'info';

  var transports = [new _winston2.default.transports.Console({
    level: level,
    handleExceptions: true,
    json: false,
    colorize: true
  })];

  if (logFile) {
    transports.push(new _winston2.default.transports.File({
      filename: logFile,
      level: level,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 50,
      colorize: false
    }));
  }

  var logger = new _winston2.default.Logger({
    transports: transports,
    exitOnError: false
  });

  app.set('logger', logger);

  var logLevel = app.get('logLevel') || 'combined';
  app.use((0, _morgan2.default)(logLevel, { stream: function stream(msg) {
      return logger.info(msg);
    } }));
};

exports.default = initiateLogging;
//# sourceMappingURL=logging.js.map