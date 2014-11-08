'use strict';

var log = require('magic-log');

exports.page = function renderPage(data, req, res, next) {
  var page     = ( req.params.page || 'index' )
    , template = 'pages/' + page
    , app      = req.app
    , pages    = app.get('pages') || [];

  //on first request the html gets cached
  if ( pages && pages[page] ) {
    return res.send(pages[page]);
  }

  res.render(template, data, function (err, html) {
    if ( err ) {
      log(err, 'error');
      if ( req.params.page === '404' ) {
        return next(err, req, res, next);
      }

      return res.redirect('/404');
    } else if ( html ) {
      //caching html of pages
      pages[page] = html;
      app.set('pages', pages);
      res.send(html);
    }
  });
}
