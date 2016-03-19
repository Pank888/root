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
//# sourceMappingURL=router.js.map