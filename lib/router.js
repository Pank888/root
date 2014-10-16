var express = require('express')
  , router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  renderPage(req, res, next);
});

router.get('/:page', function(req, res, next) {
  renderPage(req, res, next);
});

function renderPage(req, res, next) {
  var template = (req.params.page || 'index');
  
  res.render(template, function (err, html) {
    if ( err ) {
      err.status = 404;
      next(err, req, res, next);
    } else if ( html ) {
      res.send(html);
    }
  });
}

module.exports = router;
