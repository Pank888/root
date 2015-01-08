'use strict';
var log = require('magic-log');

function renderPage(res, page, template, next) {
  res.locals.page = page;
  res.render(template, function (err, html) {
    if ( err || ! html ) { return next(); } //404, no error passing!
    log('magic-view', 'Sending response');
    res.status(200).send(html);
  });
}

exports.render = {
    page: function renderPage(req, res, next) {
      var page     = ( req.params.page || 'index' )
        , template = 'pages/' + page
      ;
      log('magic-views', 'Rendering Page:', page, 'with template', template);
      renderPage(res, page, template, next);
    }
  , subPage: function renderSubPage(req, res, next) {
      var page = ( req.params.page || 'index' )
        , dir  = ( req.params.dir || false )
        , template = 'pages/' + dir + '/' + page
      ;
      if ( ! dir || ! page ) { return next(); }
      log('magic-views', 'rendering dir:', dir, 'rendering subpage', template);
      renderPage(res, page, template, next);
    }
};
