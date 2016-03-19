'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.page = exports.renderTemplate = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
      _magicServerLog2.default.error(libName + ': error in res.render ' + err);
    }

    if (!html) {
      _magicServerLog2.default.error(libName + ': html file was empty for template ' + template);
    }

    if (err || !html) {
      // 404, no error passing, next will handle it!
      return next();
    }

    res.status(200).send(html);
  });
};

var getPage = function getPage() {
  var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var locals = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  return locals.page || params.page || 'index';
};

var getTemplate = function getTemplate(_ref, _ref2) {
  var _ref$params = _ref.params;
  var params = _ref$params === undefined ? {} : _ref$params;
  var _ref2$locals = _ref2.locals;
  var locals = _ref2$locals === undefined ? {} : _ref2$locals;

  var page = getPage(params, locals);
  var template = 'pages/';

  if (params && params.dir) {
    template += params.dir + '/';
  }

  template += page;

  (0, _magicServerLog2.default)(libName + ' Rendering Page: ' + page + ' with template ' + template);

  return {
    page: page,
    template: template
  };
};

var getPageSlug = function getPageSlug(_ref3) {
  var _ref3$params = _ref3.params;
  var params = _ref3$params === undefined ? {} : _ref3$params;
  return params.page || 'index';
};

var getPageParentSlug = function getPageParentSlug(_ref4) {
  var _ref4$params = _ref4.params;
  var params = _ref4$params === undefined ? {} : _ref4$params;
  return params.dir || false;
};

var page = exports.page = function page(req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var _getTemplate = getTemplate(req, res);

  var page = _getTemplate.page;
  var template = _getTemplate.template;

  var db = req.app.get('db');

  res.locals = _extends({}, res.locals, {
    page: page,
    template: template
  });

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