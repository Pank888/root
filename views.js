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
        if ( err || ! html ) { return next(); } //404, no error passing!
        log('magic-view', 'Sending response');
        res.send(html);
      });
    }
  , subPage: function renderSubPage(req, res, next) {
    var page = ( req.params.page || 'index' )
      , dir  = ( req.params.dir || false )
      , app  = req.app
      , template = 'pages/' + dir + '/' + page
    ;
    if ( ! dir || ! page ) { return next(); }
    console.log('magic-views', 'rendering dir', dir, 'rendering subpage', page);

    res.render(template, function (err, html) {
      if ( err || ! html ) { return next(); } //404, no error passing!
      log('magic-view', 'Sending response');
      res.send(html);
    });
  }
};
