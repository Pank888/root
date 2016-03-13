import log from 'magic-log';

const libName = 'magic-pages';

const noop = () => {};

export const renderTemplate =
  (res, template, next = noop) => {
    log(`${libName}: rendering template ${template}`);
    res.render(template, (err, html) => {
      if (err) { log.error(`magic-view: error in res.render ${err}`); }
      if (!html) {
        log.error(`${libName}: html file was empty for template ${template}`);
      }
      if (err || !html) { return next(); } // 404, no error passing!
      res.status(200).send(html);
    });
  };

const getPage =
  (req, res) => {
    if (res.locals.page) { return res.locals.page; }
    return (req.params && req.params.page) ? req.params.page : 'index';
  };

const getTemplate =
  (req, res) => {
    const page = getPage(req, res);
    let template = 'pages/';

    if (req.params && req.params.dir) {
      template += req.params.dir + '/';
    }

    template += page;

    log(`${libName} Rendering Page: ${page} with template ${template}`);
    res.locals.page = page;
    res.locals.template = template;
    return template;
  };

const getPageSlug =
  req =>
    req.params && req.params.page
      ? req.params.page
      : 'index';

const getPageParentSlug =
  req =>
    req.params && req.params.dir
      ? req.params.dir
      : false;

export const page =
  (req, res, next = noop) => {
    const template = getTemplate(req, res);
    const db = req.app.get('db');

    if (!db || !db.pages) {
      return renderTemplate(res, template, next);
    }

    log.success('db.pages is set');
    const parentSlug = getPageParentSlug(req);
    const pageQuery = {
      slug: getPageSlug(req),
    };

    if (parentSlug) {
      pageQuery.parent = parentSlug;
    }

    db.pages.findOne(pageQuery, (err, page) => {
      if (err) {
        return log.error(err);
      }

      if (!page) {
        return renderTemplate(res, template, next);
      }

      // TODO: actually render db page
      console.log(page);
    });
  };
