'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Magic = exports.Router = exports.Express = exports.conjure = exports.renderPage = exports.Mailgun = exports.Nedb = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// import { init as initAdmin } from 'magic-admin';
// import blog from 'magic-blog';

var _mailgun = require('mailgun');

Object.defineProperty(exports, 'Mailgun', {
  enumerable: true,
  get: function get() {
    return _mailgun.Mailgun;
  }
});

var _pages = require('./pages');

Object.defineProperty(exports, 'renderPage', {
  enumerable: true,
  get: function get() {
    return _pages.renderPage;
  }
});

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

var _expressBabelifyMiddleware = require('express-babelify-middleware');

var _expressBabelifyMiddleware2 = _interopRequireDefault(_expressBabelifyMiddleware);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _expressErrorHandler = require('express-error-handler');

var _expressErrorHandler2 = _interopRequireDefault(_expressErrorHandler);

var _path = require('path');

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

var _magicTypes = require('magic-types');

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _headers = require('./headers');

var _headers2 = _interopRequireDefault(_headers);

var _handle = require('./errors/handle404');

var _handle2 = _interopRequireDefault(_handle);

var _handle3 = require('./errors/handle500');

var _handle4 = _interopRequireDefault(_handle3);

var _nedb = require('nedb');

var _nedb2 = _interopRequireDefault(_nedb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Nedb = _nedb2.default;
var conjure = exports.conjure = function conjure() {
  return (0, _express2.default)();
};

var Express = exports.Express = _express2.default;

var Router = exports.Router = _express2.default.Router;

var start = function start(_ref) {
  var app = _ref.app;
  var port = _ref.port;

  app.listen(port, function (err) {
    if (err) {
      _magicServerLog2.default.error(err);
    }

    (0, _magicServerLog2.default)('app listening to port ' + port);
  });
};

var Magic = exports.Magic = function Magic(app) {
  var dir = app.get('cwd') || (0, _path.join)(process.cwd(), 'src');
  var css = app.get('css') || _stylus2.default;
  var routes = app.get('routes');
  var env = app.get('env') || 'production';
  var publicDir = app.get('publicDir') || (0, _path.join)('client', 'public');
  var viewDir = app.get('viewDir') || (0, _path.join)('client', 'views');
  var appDirs = app.get('dirs');
  var basicAuthConfig = app.get('basicAuth');
  var port = app.get('port') || 1337;
  var viewEngine = app.get('view engine') || 'pug';
  var babelifyFiles = app.get('babelifyFiles');
  var logLevel = app.get('logLevel') || 'combined';
  var dirs = _extends({
    root: dir,
    public: (0, _path.join)(dir, publicDir),
    views: (0, _path.join)(dir, viewDir)
  }, appDirs);

  var logFiles = _extends({
    access: (0, _path.join)(dir, 'logs', 'access.log'),
    error: (0, _path.join)(dir, 'logs', 'error.log')
  }, app.get('logFiles'));

  var faviconPath = (0, _path.join)(dirs.public, 'favicon.ico');

  app.set('css', css);
  app.set('dirs', dirs);

  // set req.app to use in middleware
  app.use(function (req, res, next) {
    req.app = app;
    next();
  });

  // set expiry headers
  app.use(_headers2.default);

  // enable http basicAuth
  if (basicAuthConfig) {
    app.use((0, _nodeBasicauth2.default)(basicAuthConfig));
  }

  // fs.existsSync only gets called once on first request
  if (faviconPath && !app.get('faviconChecked') && !app.get('faviconExists')) {
    app.set('faviconChecked', true);
    app.set('faviconExists', _fs2.default.existsSync(faviconPath));
  }

  if (app.get('faviconExists')) {
    app.use((0, _serveFavicon2.default)(faviconPath));
  }

  app.set('views', dirs.views);
  app.set('view engine', viewEngine);

  app.use((0, _compression2.default)({ threshold: 128 }));

  var cssMiddleware = function cssMiddleware(str, path) {
    return css(str).set('filename', path).set('compress', env === 'production').use((0, _nib2.default)()).import('nib');
  };

  app.use(css.middleware({
    src: dirs.public,
    maxage: '1d',
    compile: cssMiddleware
  }));

  if ((0, _magicTypes.isString)(babelifyFiles) || (0, _magicTypes.isArray)(babelifyFiles)) {
    [].concat(babelifyFiles).forEach(function (f) {
      // Precompile a browserified file at a path
      var fileUrl = '/js/' + f + '.js';
      var bundleUrl = dirs.public + '/js/' + f + '/index.js';

      app.use(fileUrl, (0, _expressBabelifyMiddleware2.default)(bundleUrl));
    });
  }

  app.use(_express2.default.static((0, _path.join)(__dirname, 'public'), { maxAge: '1w' }));

  app.use(_express2.default.static(dirs.public, { maxAge: '1d' }));

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

  // logging
  app.use((0, _morgan2.default)(logLevel));

  app.use(app.get('env') === 'development' ? (0, _expressErrorHandler2.default)({ dumpExceptions: true, showStack: true }) : (0, _expressErrorHandler2.default)());

  if (logFiles) {
    if (logFiles.access) {
      _winston2.default.add(_winston2.default.transports.File, {
        filename: logFiles.access
      });
    }

    if (logFiles.error) {
      _winston2.default.handleExceptions(new _winston2.default.transports.File({
        filename: logFiles.error
      }));
    }
  }

  // if host sets bodyparser to true, init it
  if (app.enabled('bodyParser')) {
    app.use(_bodyParser2.default.json());
    app.use(_bodyParser2.default.urlencoded({ extended: true }));
  }

  // if host sets cookieparser to true, init it:
  if (app.enabled('cookieParser')) {
    app.use((0, _cookieParser2.default)());
  }

  // load host specific router
  if (routes) {
    if ((0, _magicTypes.isIterable)(routes)) {
      Object.keys(routes).forEach(function (key) {
        var route = routes[key];
        var _routes$key = routes[key];
        var path = _routes$key.path;
        var handler = _routes$key.handler;
        var _routes$key$method = _routes$key.method;
        var method = _routes$key$method === undefined ? 'get' : _routes$key$method;


        var isValidMethod = ['get', 'post'].some(function (v) {
          return v === method;
        });
        if (!isValidMethod) {
          throw new Error('Route method of type ' + method + ' is not valid');
        }

        if (!(0, _magicTypes.isString)(path)) {
          throw new Error('Route needs a path string to work ' + route);
        }

        if (!(0, _magicTypes.isFunction)(handler)) {
          throw new Error('Route needs a handler function to work ' + route);
        }

        app[method](path, handler);
      });
    } else if ((0, _magicTypes.isFunction)(routes)) {
      app.use(routes);
    }
  }

  // default router
  app.use(_routes2.default);

  // we are in a 404 error
  app.use(_handle2.default);

  // oops, worst case fallback, 500 server error.
  app.use(_handle4.default);

  start({ app: app, port: port });

  return app;
};

exports.default = Magic;
//# sourceMappingURL=index.js.map