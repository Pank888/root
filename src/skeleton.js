'use strict';
import express from 'express';
import basicAuth from 'node-basicauth';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import {existsSync} from 'fs';
import {init as initAdmin} from 'magic-admin';
import blog from 'magic-blog';
import db from 'magic-db';
import {handle404, handle500} from 'magic-errorHandler';
import headers from 'magic-headers';
import {log} from 'magic-log';
import router from 'magic-router';
import {each} from 'magic-utils';
import morgan from 'morgan';
import {join} from 'path';
import favicon from 'serve-favicon';
import stylus from 'stylus';
import nib from 'nib';

module.exports = (M, app, dir) => {
  var css         = ( app.get('css') || stylus )
    , env         = app.get('env') || 'production'
    , faviconPath = join(dir, 'public', 'favicon.ico')
    , dbSettings  = app.get('dbOpts') || false
    , dirs        = app.get('dirs') || {
        public: join(dir, app.get('publicDir') || 'public')
      , root  : dir
      , cache : join(dir, app.get('cacheDir') || '.cache')
      , views : join(dir, app.get('viewsDir') || 'views')
    }
  ;
  app.set('css', css);
  app.set('dirs', dirs);

  app.use( (req, res, next) => {
    req.app = app;
    next();
  });

  //set expiry headers
  app.use(headers);

  if ( app.get('basicAuth') ) {
    app.use( basicAuth( app.get('basicAuth') ) );
  }

  //fs.existsSync only gets called once on first request
  if ( ! app.get('faviconChecked') && ! app.get('faviconExists') ) {
    app.set('faviconChecked', true);
    app.set('faviconExists', existsSync(faviconPath));
  }

  if ( app.get('faviconExists') ) {
    app.use( favicon(faviconPath) );
  }

  app.set('views', dirs.views);
  app.set('view engine', app.get('view engine') || 'jade');

  app.use(compression({ threshold: 128 }));

  app.use( css.middleware({
      src: dirs.public
    , maxage: '1d'
    , compile: (str, path) => {
        return css(str)
                .set('filename', path)
                .set('compress', app.get('env') === 'production' )
                .use(nib())
                .import('nib')
        ;
      }
  }) );

  app.use( express.static(join(__dirname, 'public'), {maxAge: '1w'}) );

  app.use( express.static(dirs.public, {maxAge: '1d'}) );

  if ( dbSettings && ! app.get('db') ) {
    app.use(db);
  }

  if ( app.enabled('admin') ) {
    app.use( initAdmin );
  }

  if ( app.get('blogRoot') ) {
    let blogRoot = app.get('blogRoot');
    if ( typeof blogRoot !== 'string' && typeof blogRoot !== 'number' ) {
      blogRoot = 'blog';
    }
    if ( blogRoot.charAt(0) !== '/' ) {
      blogRoot = '/' + blogRoot;
    } else {
      app.set('blogRoot', blogRoot.substr(1) );
    }
    app.use( blogRoot, blog );
  }

  //logging
  app.use(morgan('combined'));

  //if host sets bodyparser to true, init it
  if ( app.enabled('bodyParser') ) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
  }

  //if host sets cookieparser to true, init it:
  if ( app.enabled('cookieParser') ) {
    app.use(cookieParser());
  }

  //load host specific router
  if ( app.get('router') ) {
    let routes = app.get('router');

    if ( typeof routes === 'array' || typeof routes === 'object' ) {
      each(routes, route => {
        app.use(route);
      });
    } else if ( typeof routes === 'function' ) { 
      app.use(routes);
    }
  }

  //default router
  app.use(router);

  //we are in a 404 error
  app.use(handle404);

  //oops, worst case fallback, 500 server error.
  app.use(handle500);

  return app;
}
