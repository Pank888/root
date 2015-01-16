'use strict';
var express      = require('express')
  , basicAuth    = require('node-basicauth')
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , compression  = require('compression')
  , fs           = require('fs')
  , errorHandler = require('magic-errorHandler')
  , headers      = require('magic-headers')
  , log          = require('magic-log')
  , blog         = require('magic-blog')
  , db           = require('magic-db')
  , router       = require('magic-router')
  , utils        = require('magic-utils')
  , morgan       = require('morgan')
  , path         = require('path')
  , favicon      = require('serve-favicon')
  , stylus       = require('stylus')
;

module.exports = function(M, app, dir) {
  var css         = ( app.get('css') || stylus )
    , env         = app.get('env') || 'production'
    , faviconPath = path.join(dir, 'public', 'favicon.ico')
    , dirs        = app.get('dirs') || {
        public: path.join(dir, app.get('publicDir') || 'public')
      , views : path.join(dir, app.get('viewsDir') || 'views')
    }
  ;

  if ( app.get('db') ) {
    let dbConfig = app.get('db');

    if ( dbConfig.name ) {
      app.use(function (req, res, next) {
        db(dbConfig, next);
      });
    }
  }

  app.set('dirs', dirs);

  app.use(function (req, res, next) {
    req.app = app;
    next();
  });

  //set expiry headers
  app.use(headers);

  if ( app.get('basicAuth') ) {
    app.use(
      basicAuth( app.get('basicAuth') )
    );
  }

  //fs.existsSync only gets called once on first request
  if ( ! app.get('faviconChecked') && ! app.get('faviconExists') ) {
    app.set('faviconChecked', true);
    app.set('faviconExists', fs.existsSync(faviconPath));
  }

  if ( app.get('faviconExists') ) {
    app.use( favicon(faviconPath) );
  }

  app.set('views', dirs.views);
  app.set('view engine', app.get('view engine') || 'jade');

  app.use(compression({ threshold: 128 }));

  app.use( css.middleware(dirs.public, {maxAge: '1d'}) );
  app.use( express.static(dirs.public, {maxAge: '1d'}) );

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
      utils.each(routes, function (route) {
        app.use(route);
      });
    } else if ( typeof routes === 'function' ) { 
      app.use(routes);
    }
  }

  //default router
  app.use(router);

  //we are in a 404 error
  app.use(errorHandler.handle404);

  //oops, worst case fallback, 500 server error.
  app.use(errorHandler.handle500);

  return app;
}
