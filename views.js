'use strict';
var log = require('magic-log');

exports.render = {
  page: function renderPage(req, res, next) {
    var page     = ( req.params.page || 'index' )
      , template = 'pages/' + page
      , app      = req.app
      , pages    = app.get('pages') || []
      , data     = {}
    ;

    log('Rendering Page: ', page);

    //on first request the html gets cached
    if ( pages && pages[page] ) {
      return res.send(pages[page]);
    }

    res.render(template, data, function (err, html) {
      if ( err ) { log.error(err); }

      if ( ! html ) {
        let err = {status:404};
        return next(err, req, res, next);
      }

      pages[page] = html; 
      app.set('pages', pages); //caching pages
      res.send(html);
    });
  }
};
