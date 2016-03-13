import {log, error, success} from 'magic-log';

export function renderTemplate(res, template, next) {
  log(`magic-view: rendering template ${template}`);
  res.render(template, (err, html) => {
    if ( err ) { error(`magic-view: error in res.render ${err}`); }
    if ( ! html ) { 
      error(`magic-view: html file was empty for template ${template}`);
    }
    if ( err || ! html ) { return next(); } //404, no error passing!
    res.status(200).send(html);
  });
}

function getPage(req, res) {
  if ( res.locals.page ) { return res.locals.page; }
  return (req.params && req.params.page ) ? req.params.page : 'index';
}


function getTemplate(req, res) {
  var page     = getPage(req, res)
    , template = 'pages/'
  ;

  if ( req.params && req.params.dir ) {
    template += req.params.dir + '/';
  }
  
  template += page;

  log('magic-view', 'Rendering Page:', page, 'with template', template);
  res.locals.page = page;
  res.locals.template = template;
  return template;
}

function getPageSlug(req) {
  return (req.params && req.params.page ) ? req.params.page : 'index';
}

function getPageParentSlug(req) {
  return (req.params && req.params.dir ) ? req.params.dir : false;
}

export function page(req, res, next) {
  var template = getTemplate(req, res)
    , db       = req.app.get('db')
  ;
  if ( ! db || ! db.pages ) {
    renderTemplate(res, template, next);
  } else {
    success('db.pages is set');
    var parentSlug = getPageParentSlug(req)
      , pageQuery = {
        slug: getPageSlug(req)
      }
    ;
    if ( parentSlug ) {
      pageQuery.parent = parentSlug;
    }

    db.pages.findOne(pageQuery, (err, page) => {
      if (err) { return error(err); }

      if ( ! page ) {
        return renderTemplate(res, template, next);
      }

      console.log(page);
    });
  }
}
