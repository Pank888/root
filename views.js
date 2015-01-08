'use strict';
var log = require('magic-log');

function renderPage(res, template, next) {
  res.render(template, function (err, html) {
    if ( err ) { log.error('magic-view', 'error in res.render', err); }
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
      //~ res.locals.page = page;
      renderPage(res, template, next);
    }
  , subPage: function renderSubPage(req, res, next) {
      var page = ( req.params.page || 'index' )
        , dir  = ( req.params.dir || false )
        , template = 'pages/' + dir + '/' + page
      ;
      if ( ! dir || ! page ) { return next(); }
      //~ res.locals.page = dir + '/' + page;
      log('magic-views', 'rendering dir:', dir, 'rendering subpage', template);
      renderPage(res, template, next);
    }
};
