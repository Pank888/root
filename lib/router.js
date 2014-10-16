var express = require('express')
  , router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/:page', function(req, res, next) {
  var template = (req.params.page || 'index');
  
  res.render(template, function (err, html) {
    if ( err ) {
      if ( err.view && err.view.name ) {
        next();
      } else {
        next(err);
      }
    } else if ( html ){
      res.send(html);
    }
  });
});

module.exports = router;
