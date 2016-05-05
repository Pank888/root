'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

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
//# sourceMappingURL=routes.js.map