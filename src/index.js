import express from 'express';
import basicAuth from 'node-basicauth';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import babel from 'babel-middleware';
import fs from 'fs';
import morgan from 'morgan';
import { join } from 'path';
import favicon from 'serve-favicon';
import stylus from 'stylus';
import nib from 'nib';

import { isArray, isObject, isFunction } from 'magic-types';
import log from 'magic-server-log';

import router from './router';
import headers from './headers';
import handle404 from './errors/handle404';
import handle500 from './errors/handle500';

// import { init as initAdmin } from 'magic-admin';
// import blog from 'magic-blog';
// import db from 'magic-db';

export const Magic = app => {
  const dir = process.cwd();
  const css = app.get('css') || stylus;
  // const dbSettings = app.get('dbOpts') || false;
  const routes = app.get('router');
  const env = app.get('env') || 'production';
  const faviconPath = join(dir, 'public', 'favicon.ico');
  const publicDir = app.get('publicDir') || 'public';
  const viewDir = app.get('viewDir') || 'views';
  const appDirs = app.get('dirs');
  const basicAuthConfig = app.get('basicAuth');
  const port = app.get('port') || 5000;
  const viewEngine = app.get('view engine') || 'jade';
  const babelConfig = app.get('babel');

  const dirs = {
    root: dir,
    public: join(dir, publicDir),
    views: join(dir, viewDir),
    ...appDirs,
  };

  console.log({ dirs, env });

  app.set('css', css);
  app.set('dirs', dirs);

  // set req.app to use in middleware
  app.use(
    (req, res, next) => {
      req.app = app;
      next();
    });

  if (babelConfig) {
    app.use('/js/', babel(babelConfig));
  }

  // set expiry headers
  app.use(headers);

  // enable http basicAuth
  if (basicAuthConfig) {
    app.use(basicAuth(basicAuthConfig));
  }

  // fs.existsSync only gets called once on first request
  if (!app.get('faviconChecked') && !app.get('faviconExists')) {
    app.set('faviconChecked', true);
    app.set('faviconExists', fs.existsSync(faviconPath));
  }

  if (app.get('faviconExists')) {
    app.use(favicon(faviconPath));
  }

  app.set('views', dirs.views);
  app.set('view engine', viewEngine);

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
  if (routes) {
    if (isArray(routes) || isObject(routes)) {
      Object.keys(routes).forEach(
        key => {
          if (isFunction(routes[key])) {
            app.use(routes[key]);
          }
        }
      );
    } else if (isFunction(routes)) {
      app.use(routes);
    }
  }

  // default router
  app.use(router);

  // we are in a 404 error
  app.use(handle404);

  // oops, worst case fallback, 500 server error.
  app.use(handle500);

  app.get('*', (req, res, next) => {
    console.log('catchall');
    res.status(200).send('yay');
  });

  app.listen(port, err => {
    if (err) {
      log.error(err);
    }

    log(`app listening to port ${port}`);
  });

  return app;
};
