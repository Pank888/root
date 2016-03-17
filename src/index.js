import express from 'express';
import basicAuth from 'node-basicauth';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { existsSync } from 'fs';
import { isArray, isObject } from 'magic-types';
import headers from 'magic-http-headers';
import morgan from 'morgan';
import { join } from 'path';
import favicon from 'serve-favicon';
import stylus from 'stylus';
import nib from 'nib';

import router from './router';
import handle404 from './handle404';
import handle500 from './handle500';

// import { init as initAdmin } from 'magic-admin';
// import blog from 'magic-blog';
// import db from 'magic-db';

export default
  (M, app, dir) => {
    const css = app.get('css') || stylus;
    const env = app.get('env') || 'production';
    const faviconPath = join(dir, 'public', 'favicon.ico');
    // const dbSettings = app.get('dbOpts') || false;

    const dirs = {
      root: dir,
      public: join(dir, app.get('publicDir') || 'public'),
      cache: join(dir, app.get('cacheDir') || '.cache'),
      views: join(dir, app.get('viewsDir') || 'views'),
      ...app.get('dirs'),
    };

    app.set('css', css);
    app.set('dirs', dirs);

    app.use(
      (req, res, next) => {
        req.app = app;
        next();
      });

    // set expiry headers
    app.use({
      ...headers,
      ...app.get('headers'),
    });

    const basicAuthConfig = app.get('basicAuth');
    if (basicAuthConfig) {
      app.use(basicAuth(basicAuthConfig));
    }

    // fs.existsSync only gets called once on first request
    if (!app.get('faviconChecked') && !app.get('faviconExists')) {
      app.set('faviconChecked', true);
      app.set('faviconExists', existsSync(faviconPath));
    }

    if (app.get('faviconExists')) {
      app.use(favicon(faviconPath));
    }

    app.set('views', dirs.views);
    app.set('view engine', app.get('view engine') || 'jade');

    app.use(compression({ threshold: 128 }));

    const cssMiddleware =
      (str, path) =>
        css(str)
          .set('filename', path)
          .set('compress', env === 'production')
          .use(nib())
          .import('nib');

    app.use(css.middleware({
      src: dirs.public,
      maxage: '1d',
      compile: cssMiddleware,
    }));

    app.use(express.static(join(__dirname, 'public'), { maxAge: '1w' }));

    app.use(express.static(dirs.public, { maxAge: '1d' }));

    // if (dbSettings && !app.get('db')) {
    //   app.use(db);
    // }

    // if (app.enabled('admin')) {
    //   app.use(initAdmin);
    // }

    /*
    TODO: reenable
    if (app.get('blogRoot')) {
      let blogRoot = app.get('blogRoot');
      if (typeof blogRoot !== 'string' && typeof blogRoot !== 'number') {
        blogRoot = 'blog';
      }
      if (blogRoot.charAt(0) !== '/') {
        blogRoot = '/' + blogRoot;
      } else {
        app.set('blogRoot', blogRoot.substr(1));
      }
      app.use(blogRoot, blog);
    }
    */

    const logLevel = app.get('logLevel') || 'combined';

    // logging
    app.use(morgan(logLevel));

    // if host sets bodyparser to true, init it
    if (app.enabled('bodyParser')) {
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
    }

    // if host sets cookieparser to true, init it:
    if (app.enabled('cookieParser')) {
      app.use(cookieParser());
    }

    // load host specific router
    if (app.get('router')) {
      const routes = app.get('router');

      if (isArray(routes) || isObject(routes)) {
        Object.keys(routes).forEach(
          key =>
            app.use(routes[key])
          );
      } else if (typeof routes === 'function') {
        app.use(routes);
      }
    }

    // default router
    app.use(router);

    // we are in a 404 error
    app.use(handle404);

    // oops, worst case fallback, 500 server error.
    app.use(handle500);

    return app;
  };
