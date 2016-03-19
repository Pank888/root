'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle404 = undefined;

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

var _pages = require('./pages');

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

  (0, _pages.page)(req, res, function (err) {
    if (err) {
      _magicServerLog2.default.error('404 page template for host: ' + req.hostname + ' not found');
      return next(err);
    }
  });
};

exports.default = handle404;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle500 = undefined;

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handle500 = exports.handle500 = function handle500(err, req, res) {
  _magicServerLog2.default.error('500 called, err: ' + err);
  res.send('500 server error');
};

exports.default = handle500;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var noop = function noop() {};

// http header middleware function
var headers = exports.headers = function headers(req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var app = req.app;
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

var _handle = require('./handle404');

var _handle2 = _interopRequireDefault(_handle);

var _handle3 = require('./handle500');

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
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.page = exports.renderTemplate = undefined;

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var libName = 'magic-pages';

var noop = function noop() {};

var renderTemplate = exports.renderTemplate = function renderTemplate(res, template) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  (0, _magicServerLog2.default)(libName + ': rendering template ' + template);
  res.render(template, function (err, html) {
    if (err) {
      _magicServerLog2.default.error('magic-view: error in res.render ' + err);
    }
    if (!html) {
      _magicServerLog2.default.error(libName + ': html file was empty for template ' + template);
    }
    if (err || !html) {
      return next();
    } // 404, no error passing!
    res.status(200).send(html);
  });
};

var getPage = function getPage(req, res) {
  if (res.locals.page) {
    return res.locals.page;
  }
  return req.params && req.params.page ? req.params.page : 'index';
};

var getTemplate = function getTemplate(req, res) {
  var page = getPage(req, res);
  var template = 'pages/';

  if (req.params && req.params.dir) {
    template += req.params.dir + '/';
  }

  template += page;

  (0, _magicServerLog2.default)(libName + ' Rendering Page: ' + page + ' with template ' + template);
  res.locals.page = page;
  res.locals.template = template;
  return template;
};

var getPageSlug = function getPageSlug(req) {
  return req.params && req.params.page ? req.params.page : 'index';
};

var getPageParentSlug = function getPageParentSlug(req) {
  return req.params && req.params.dir ? req.params.dir : false;
};

var page = exports.page = function page(req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var template = getTemplate(req, res);
  var db = req.app.get('db');

  if (!db || !db.pages) {
    return renderTemplate(res, template, next);
  }

  _magicServerLog2.default.success('db.pages is set');
  var parentSlug = getPageParentSlug(req);
  var pageQuery = {
    slug: getPageSlug(req)
  };

  if (parentSlug) {
    pageQuery.parent = parentSlug;
  }

  db.pages.findOne(pageQuery, function (err, page) {
    if (err) {
      return _magicServerLog2.default.error(err);
    }

    if (!page) {
      return renderTemplate(res, template, next);
    }

    // TODO: actually render db page
    console.log(page);
  });
};
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _pages = require('./pages');

var noop = function noop() {};

var router = (0, _express.Router)();

router.get('/', function (req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  res.locals.page = 'index';
  (0, _pages.page)(req, res, next);
});

router.get('/:page', _pages.page);

exports.default = router;

//# sourceMappingURL=index.js.map