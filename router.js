var express = require('express')
  , router  = express.Router()
  , log     = require('magic-log')
  , view    = require('magic-view')
;

router.get('/', function(req, res, next) {
  log.info('magic-router', '/ route called');
  view.render.page(req, res, next);
});

router.get('/:page', function(req, res, next) {
  log.info('magic-router', '/:page route called', req.params.page);
  view.render.page(req, res, next);
});

module.exports = router;
