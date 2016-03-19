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
//# sourceMappingURL=pages.js.map