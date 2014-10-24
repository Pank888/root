var express = require('express')
  , log     = require('magic-log')
  , router  = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  renderPage({}, req, res, next);
});

router.get('/:page', function(req, res, next) {
  renderPage({}, req, res, next);
});

function renderPage(data, req, res, next) {
  var template = (req.params.page || 'index');

  log('Host: ' + req.hostname + ' Rendering page template: ' + template);

  res.render(template, data, function (err, html) {
    if ( err ) {
      err.status = 404;
      next(err, req, res, next);
    } else if ( html ) {
      res.send(html);
    }
  });
}


module.exports = router;
