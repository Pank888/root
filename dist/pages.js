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

var page = exports.page = function page(req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  var _getTemplate = getTemplate(req, res);

  var page = _getTemplate.page;
  var template = _getTemplate.template;


  res.locals = _extends({}, res.locals, {
    page: page,
    template: template
  });

  (0, _magicServerLog2.default)('render page: ', page, 'with template', template);

  return renderTemplate(res, template, next);
};
//# sourceMappingURL=pages.js.map