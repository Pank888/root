'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle500 = exports.handle404 = undefined;

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

var _magicPages = require('magic-pages');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {};

var handle404 = exports.handle404 = function handle404(req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var app = req.app;
  var p404 = app.get('404page') || '404';
  var r404 = app.get('404redirect') || false;

  _magicServerLog2.default.warn('404 error page called, page was: ' + req.params.page);

  if (r404) {
    (0, _magicServerLog2.default)('magic-errorHandler r404 was set in host, redirect: ' + r404);
    return res.redirect(r404);
  }

  req.params.page = p404;
  res.status(404);

  (0, _magicPages.page)(req, res, function (err) {
    if (err) {
      _magicServerLog2.default.error('404 page template for host: ' + req.hostname + ' not found');
      return next(err);
    }
  });
};

var handle500 = exports.handle500 = function handle500(err, req, res) {
  _magicServerLog2.default.error('500 called, err: ' + err);
  res.send('500 server error');
};
