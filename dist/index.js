'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Magic = exports.Router = exports.Express = exports.conjure = exports.renderPage = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _path = require('path');

var _favicon = require('./favicon');

var _favicon2 = _interopRequireDefault(_favicon);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

var _nedb = require('nedb');

var _nedb2 = _interopRequireDefault(_nedb);

var _mailgun = require('mailgun');

var _magicTypes = require('magic-types');

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _logging = require('./logging');

var _logging2 = _interopRequireDefault(_logging);

var _headers = require('./headers');

var _headers2 = _interopRequireDefault(_headers);

var _handle = require('./errors/handle404');

var _handle2 = _interopRequireDefault(_handle);

var _handle3 = require('./errors/handle500');

var _handle4 = _interopRequireDefault(_handle3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var conjure = exports.conjure = function conjure() {
  return (0, _express2.default)();
};

var Express = exports.Express = _express2.default;

var Router = exports.Router = _express2.default.Router;

var start = function start(_ref) {
  var app = _ref.app;
  var port = _ref.port;

  app.listen(port, function (err) {
    var log = app.get('logger');
    if (err) {
      log.error(err);
    }

    log.info('app listening to port ' + port);
  });
};

var Magic = exports.Magic = function Magic(app) {
  var dir = app.get('cwd') || (0, _path.join)(process.cwd(), 'src');
  var env = app.get('env') || 'production';
  var publicDir = app.get('publicDir') || (0, _path.join)('client', 'public');
  var viewDir = app.get('viewDir') || (0, _path.join)('client', 'views');
  var logDir = app.get('logDir') || (0, _path.join)('..', 'logs');
  var appDirs = app.get('dirs');
  var basicAuthConfig = app.get('basicAuth');
  var port = app.get('port') || 1337;
  var viewEngine = app.get('view engine') || 'pug';
  var babelifyFiles = app.get('babelifyFiles');
  var dirs = _extends({
    root: dir,
    public: (0, _path.join)(dir, publicDir),
    views: (0, _path.join)(dir, viewDir),
    logs: (0, _path.join)(dir, logDir)
  }, appDirs);

  // set req.app and req.db to use in middleware
  app.use(function (req, res, next) {
    req.app = app;
    req.db = db;

    next();
  });

  var dbFile = app.get('dbFile') || false;
  var mailgunApiKey = app.get('mailgunApiKey') || false;

  app.set('dirs', dirs);

  (0, _favicon2.default)(app);

  app.set('views', dirs.views);
  app.set('view engine', viewEngine);

  app.use((0, _compression2.default)({ threshold: 128 }));

  // initiate nedb if defined
  var db = void 0;
  if (dbFile) {
    db = new _nedb2.default({
      filename: dbFile,
      autoload: true
    });
    app.set('db', db);
  }

  // initiate mailgun if defined
  if (mailgunApiKey) {
    app.set('mg', new _mailgun.Mailgun(mailgunApiKey));
  }

  // set expiry and custom headers
  app.use(_headers2.default);

  // enable http basicAuth
  if (basicAuthConfig) {
    app.use((0, _nodeBasicauth2.default)(basicAuthConfig));
  }

  var css = app.get('css') || _stylus2.default;
  app.set('css', css);

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
  // Blog Middleware
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

  (0, _logging2.default)(app);

  // if host sets bodyparser to true, init it
  if (app.enabled('bodyParser')) {
    app.use(_bodyParser2.default.json());
    app.use(_bodyParser2.default.urlencoded({ extended: true }));
  }

  // if host sets cookieparser to true, init it:
  if (app.enabled('cookieParser')) {
    app.use((0, _cookieParser2.default)());
  }

  // initiate api if defined
  var apiRoutes = app.get('api');
  if (apiRoutes) {
    app.use((0, _api2.default)(apiRoutes));
  }

  (0, _routes.customRoutes)(app);

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