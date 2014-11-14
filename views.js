'use strict';
var log = require('magic-log');

exports.render = {
  page: function renderPage(req, res, next) {
    var page     = ( req.params.page || 'index' )
      , app      = req.app
      , template = 'pages/' + page
      , pages    = app.get('pages') || []
      , data     = {}
      , views    = app.get('views')
    ;

    log('Rendering Page:', page, 'with template:', template);

    res.render(template, data, function (err, html) {
      if ( err ) { return next(err); }
      if ( ! html ) { return next();}
      res.send(html);
    });
  }
};
