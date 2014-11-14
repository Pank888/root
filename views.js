'use strict';
var log = require('magic-log');

exports.render = {
  page: function renderPage(req, res, next) {
    var page     = ( req.params.page || 'index' )
      , app      = req.app
      , template = 'pages/' + page
    ;
    log('magic-views', 'Rendering Page:', page);

    res.render(template, function (err, html) {
      if ( err ) { return next(err); }
      if ( ! html ) { return next();}
      res.send(html);
    });
  }
};
