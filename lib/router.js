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
  var template = 'pages/' + (req.params.page || 'index');

  res.render(template, data, function (err, html) {
    if ( err ) {
      return res.redirect('/404');
    } else if ( html ) {
      res.send(html);
    }
  });
}

module.exports = router;
