'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customRoutes = undefined;

var _express = require('express');

var _magicTypes = require('magic-types');

var _pages = require('./pages');

var _pages2 = _interopRequireDefault(_pages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {};

var router = (0, _express.Router)();

router.get('/', function (req, res) {
  var next = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

  res.locals.page = 'index';
  (0, _pages2.default)(req, res, next);
});

router.get('/:page', _pages2.default);

exports.default = router;
var customRoutes = exports.customRoutes = function customRoutes(app) {
  var routes = app.get('routes');

  // load host specific router
  if (routes) {
    if ((0, _magicTypes.isIterable)(routes)) {
      Object.keys(routes).forEach(function (key) {
        var route = routes[key];
        var path = route.path;
        var handler = route.handler;
        var _route$method = route.method;
        var method = _route$method === undefined ? 'get' : _route$method;


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
};
//# sourceMappingURL=routes.js.map