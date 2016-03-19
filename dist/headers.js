'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var noop = function noop() {};

// http header middleware function
var headers = exports.headers = function headers(_ref, res) {
  var _ref$app = _ref.app;
  var app = _ref$app === undefined ? {} : _ref$app;
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var env = app.get('env') || 'production';
  var poweredBy = app.get('X-Powered-By') || 'Magic';
  var maxAge = app.get('maxAge') || 60 * 60 * 24 * 7; // default to 7 days

  if (env !== 'development') {
    res.set('Cache-Control', 'public, max-age=' + maxAge);
    res.set('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  }

  res.set('X-Powered-By', poweredBy);
  next();
};

exports.default = headers;
//# sourceMappingURL=headers.js.map