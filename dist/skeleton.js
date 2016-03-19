'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeBasicauth = require('node-basicauth');

var _nodeBasicauth2 = _interopRequireDefault(_nodeBasicauth);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _fs = require('fs');

var _magicTypes = require('magic-types');

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _path = require('path');

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _headers = require('./headers');

var _headers2 = _interopRequireDefault(_headers);

var _handle = require('./errors/handle404');

var _handle2 = _interopRequireDefault(_handle);

var _handle3 = require('./errors/handle500');

var _handle4 = _interopRequireDefault(_handle3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { init as initAdmin } from 'magic-admin';
// import blog from 'magic-blog';
// import db from 'magic-db';

exports.default = function (M, app, dir) {
  var css = app.get('css') || _stylus2.default;
  var env = app.get('env') || 'production';
  var faviconPath = (0, _path.join)(dir, 'public', 'favicon.ico');
  // const dbSettings = app.get('dbOpts') || false;

  var dirs = _extends({
    root: dir,
    public: (0, _path.join)(dir, app.get('publicDir') || 'public'),
    cache: (0, _path.join)(dir, app.get('cacheDir') || '.cache'),
    views: (0, _path.join)(dir, app.get('viewsDir') || 'views')
  }, app.get('dirs'));

  app.set('css', css);
  app.set('dirs', dirs);

  app.use(function (req, res, next) {
    req.app = app;
    next();
  });

  // set expiry headers
  app.use(_extends({}, _headers2.default, app.get('headers')));

  var basicAuthConfig = app.get('basicAuth');
  if (basicAuthConfig) {
    app.use((0, _nodeBasicauth2.default)(basicAuthConfig));
  }

  // fs.existsSync only gets called once on first request
  if (!app.get('faviconChecked') && !app.get('faviconExists')) {
    app.set('faviconChecked', true);
    app.set('faviconExists', (0, _fs.existsSync)(faviconPath));
  }

  if (app.get('faviconExists')) {
    app.use((0, _serveFavicon2.default)(faviconPath));
  }

  app.set('views', dirs.views);
  app.set('view engine', app.get('view engine') || 'jade');

  app.use((0, _compression2.default)({ threshold: 128 }));

  var cssMiddleware = function cssMiddleware(str, path) {
    return css(str).set('filename', path).set('compress', env === 'production').use((0, _nib2.default)()).import('nib');
  };

  app.use(css.middleware({
    src: dirs.public,
    maxage: '1d',
    compile: cssMiddleware
  }));

  app.use(_express2.default.static((0, _path.join)(__dirname, 'public'), { maxAge: '1w' }));

  app.use(_express2.default.static(dirs.public, { maxAge: '1d' }));

  // if (dbSettings && !app.get('db')) {
  //   app.use(db);
  // }

  // if (app.enabled('admin')) {
  //   app.use(initAdmin);
  // }

  /*
  TODO: reenable
  if (app.get('blogRoot')) {
    let blogRoot = app.get('blogRoot');
    if (typeof blogRoot !== 'string' && typeof blogRoot !== 'number') {
      blogRoot = 'blog';
    }
    if (blogRoot.charAt(0) !== '/') {
      blogRoot = '/' + blogRoot;
    } else {
      app.set('blogRoot', blogRoot.substr(1));
    }
    app.use(blogRoot, blog);
  }
  */

  var logLevel = app.get('logLevel') || 'combined';

  // logging
  app.use((0, _morgan2.default)(logLevel));

  // if host sets bodyparser to true, init it
  if (app.enabled('bodyParser')) {
    app.use(_bodyParser2.default.json());
    app.use(_bodyParser2.default.urlencoded({ extended: false }));
  }

  // if host sets cookieparser to true, init it:
  if (app.enabled('cookieParser')) {
    app.use((0, _cookieParser2.default)());
  }

  // load host specific router
  if (app.get('router')) {
    (function () {
      var routes = app.get('router');

      if ((0, _magicTypes.isArray)(routes) || (0, _magicTypes.isObject)(routes)) {
        Object.keys(routes).forEach(function (key) {
          return app.use(routes[key]);
        });
      } else if (typeof routes === 'function') {
        app.use(routes);
      }
    })();
  }

  // default router
  app.use(_router2.default);

  // we are in a 404 error
  app.use(_handle2.default);

  // oops, worst case fallback, 500 server error.
  app.use(_handle4.default);

  return app;
};

module.exports = exports['default'];
//# sourceMappingURL=skeleton.js.map