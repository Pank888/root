'use strict';
var express      = require('express')
  //~ , db           = require('magic-db')
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , compression  = require('compression')
  , fs           = require('fs')
  , errorHandler = require('magic-errorHandler')
  , headers      = require('magic-headers')
  , log          = require('magic-log')
  , auth         = require('magic-auth')
  , blog         = require('magic-blog')
  , router       = require('magic-router')
  , browserify   = require('magic-browserify')
  , sslRedirect  = require('magic-ssl')
  , morgan       = require('morgan')
  , path         = require('path')
  , favicon      = require('serve-favicon')
  , stylus       = require('stylus')
;

module.exports = function(M, S, dir) {
  var css         = ( S.get('css') || stylus )
    , env         = S.get('env') || 'production'
    //~ , dbConf      = S.get('db') || false
    , faviconPath = path.join(dir, 'public', 'favicon.ico')
    , dirs        = S.get('dirs') || {
        public: path.join(dir, 'public')
      , views : path.join(dir, 'views')
    }
  ;

  S.set('dirs', dirs);

  S.use(function (req, res, next) {
    req.app = S;
    next();
  });

  if ( ! S.enabled('allowHttp') && S.get('env') === 'production' ) {
   // S.use(sslRedirect);
  }

  //set expiry headers
  S.use(headers);

  //fs.existsSync only gets called once
  if ( ! S.get('faviconExistenceCheck') ) {
    S.set('faviconExistenceCheck', true);
    S.set('faviconExists', fs.existsSync(faviconPath));
  }

  if ( S.get('faviconExists') ) {
    S.use( favicon(faviconPath) );
  }

  S.set('views', dirs.views);
  S.set('view engine', S.get('view engine') || 'jade');

  S.use(compression({ threshold: 128 }));

  S.use( css.middleware(dirs.public, {maxAge: '1d'}) );
  S.use( express.static(dirs.public, {maxAge: '1d'}) );

/*  if ( S.get('db') ) {
    let dbConf = S.get('db');

    S.use(function (req, res, next) {
      db(dbConf, function (err, mongoose) {
      if ( err ) { log.error(err); }
        S.set('mongoose', mongoose);
        next();
      });
    } );
  }
*/

  if ( S.get('blogRoot') ) {
    S.use( blog );
  }

  //logging
  S.use(morgan('combined'));

  //if host sets bodyparser to true, init it
  if ( S.enabled('bodyParser') ) {
    S.use(bodyParser.json());
    S.use(bodyParser.urlencoded({ extended: false }));
  }

  //if host sets cookieparser to true, init it:
  if ( S.enabled('cookieParser') ) {
    S.use(cookieParser());
  }

  //use magic-auth
  if ( S.enabled('useAuth') ) {
    S.use(function (req, res, next) {
       auth.routes(S, req, res, next);
    });
  }

  //load host specific router
  if ( S.get('router') ) {
    let routes = S.get('router');

    if ( typeof routes === 'array' || typeof routes === 'object' ) {
      for (let route in routes ) {
        if ( routes.hasOwnProperty(route) ) {
          S.use(routes[route]);
        }
      }
    } else if ( typeof routes === 'function' ) { 
      S.use(routes);
    }
  }

  //default router
  S.use(router);

  //we are in a 404 error
  S.use(errorHandler.handle404);

  //oops, worst case fallback, 500 server error.
  S.use(errorHandler.handle500);

  return S;
}
