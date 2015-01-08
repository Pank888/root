'use strict';
var log = require('magic-log')
  , view = {}
;

function renderPage(res, template, next) {
  log('magic-view', 'rendering page', template);
  res.render(template, function (err, html) {
    log('magic-view', 'rendered page');
    if ( err ) { log.error('magic-view', 'error in res.render', err); }
    if ( err || ! html ) { return next(); } //404, no error passing!
    log('magic-view', 'Sending response');
    res.status(200).send(html);
  });
}

view.page = function renderPage(req, res, next) {
  var page     = ( req.params.page || 'index' )
    , template = 'pages/' + page
  ;
  log('magic-view', 'Rendering Page:', page, 'with template', template);
  res.locals.page = page;
  res.render(template, function (err, html) {
    log('magic-view', 'rendered page');
    if ( err ) { log.error('magic-view', 'error in res.render', err); }
    if ( err || ! html ) { return next(); } //404, no error passing!
    log('magic-view', 'Sending response');
    res.status(200).send(html);
  });
}

view.subPage = function renderSubPage(req, res, next) {
  var page = ( req.params.page || 'index' )
    , dir  = ( req.params.dir || false )
    , template = 'pages/' + dir + '/' + page
  ;
  if ( ! dir || ! page ) { return next(); }
  //~ res.locals.page = dir + '/' + page;
  log('magic-view', 'rendering dir:', dir, 'rendering subpage', template);
  renderPage(res, template, next);
}

module.exports = view;
