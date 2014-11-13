var express = require('express')
  , log     = require('magic-log')
  , view    = require('magic-view')
  , router  = express.Router()
;

router.get('/', function(req, res, next) {
  view.render.page(req, res, next);
});

router.get('/:page', function(req, res, next) {
  view.render.page(req, res, next);
});

module.exports = router;
