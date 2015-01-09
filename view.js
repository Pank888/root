'use strict';
var log = require('magic-log')
  , view = {}
;

function renderTemplate(res, template, next) {
  log('magic-view', 'rendering pagetemplate', template);
  res.render(template, function (err, html) {
    log('magic-view', 'rendered page');
    if ( err ) { log.error('magic-view', 'error in res.render', err); }
    if ( ! html ) { 
      log.error('magic-view', 'html file was empty for template', template);
    }
    if ( err || ! html ) { return next(); } //404, no error passing!
    log('magic-view', 'Sending response');
    res.status(200).send(html);
  });
}

function getPage(req) {
  return (req.params && req.params.page ) ? req.params.page : 'index';
}


function getTemplate(req, res) {
  var page     = getPage(req)
    , template = page
  ;

  if ( req.params && req.params.dir ) {
    template = req.params.dir + '/' + page;
  }

  log('magic-view', 'Rendering Page:', page, 'with template', template);
  res.locals.page = page;
  res.locals.template = template;
  return template;
}

view.page = function renderPage(req, res, next) {
  var template = getTemplate(req, res);
  renderTemplate(res, template, next);
}

module.exports = view;
