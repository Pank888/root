'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var noop = function noop() {};

// http header middleware function
var headers = exports.headers = function headers(_ref, res) {
  var _ref$app = _ref.app;
  var app = _ref$app === undefined ? {} : _ref$app;
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var env = app.get('env') || 'production';
  var poweredBy = app.get('X-Powered-By') || 'Magic';
  var maxAge = app.get('maxAge') || 60 * 60 * 24 * 7; // default to 7 days
  var appHeaders = app.get('headers') || {};

  var headers = {};

  if (env !== 'development') {
    headers['Expires'] = new Date(Date.now() + maxAge * 1000).toUTCString();
    headers['Cache-Control'] = 'public, max-age=' + maxAge;
  }

  headers['X-Powered-By'] = poweredBy;
  headers['server'] = poweredBy;

  headers = _extends({}, headers, appHeaders);

  Object.keys(headers).forEach(function (key) {
    return res.set(key, headers[key]);
  });

  next();
};

exports.default = headers;
//# sourceMappingURL=headers.js.map