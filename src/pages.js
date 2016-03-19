import log from 'magic-server-log';

const libName = 'magic-pages';

const noop = () => {};

export const renderTemplate =
  (res, template, next = noop) => {
    log(`${libName}: rendering template ${template}`);
    res.render(template, (err, html) => {
      if (err) {
        log.error(`${libName}: error in res.render ${err}`);
      }

      if (!html) {
        log.error(`${libName}: html file was empty for template ${template}`);
      }

      if (err || !html) {
        // 404, no error passing, next will handle it!
        return next();
      }

      res.status(200).send(html);
    });
  };

const getPage =
  (params = {}, locals = {}) =>
    locals.page || params.page || 'index';

const getTemplate =
  ({ params = {}}, { locals = {}}) => {
    const page = getPage(params, locals);
    let template = 'pages/';

    if (params && params.dir) {
      template += params.dir + '/';
    }

    template += page;

    log(`${libName} Rendering Page: ${page} with template ${template}`);

    return {
      page,
      template,
    };
  };

export const page =
  (req, res, next = noop) => {
    const { page, template } = getTemplate(req, res);

    res.locals = {
      ...res.locals,
      page,
      template,
    };

    log('render page: ', page, 'with template', template);

    return renderTemplate(res, template, next);
  };
