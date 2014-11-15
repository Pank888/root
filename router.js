var express = require('express')
  , router  = express.Router()
  , log     = require('magic-log')
  , view    = require('magic-view')
;

router.get('/', view.render.page);
router.get('/:page', view.render.page);

module.exports = router;
