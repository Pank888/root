var express = require('express')
  , router  = express.Router()
  , log     = require('magic-log')
  , view    = require('magic-view')
;

router.get('/', view.page);
router.get('/:dir/:page', view.page);
router.get('/:page', view.page);

module.exports = router;
