'use strict';

var db           = require('magic-db')
  , express      = require('express')
  , stylus       = require('stylus')
  , bodyParser   = require('body-parser')
  , cookieParser = require('cookie-parser')
  , compression  = require('compression')
  , favicon      = require('serve-favicon')
  , fs           = require('fs')
  , morgan       = require('morgan')
  , errorHandler = require('magic-errorHandler')
  , headers      = require('magic-headers')
  , log          = require('magic-log')
  , menu         = require('magic-menu')
  , auth         = require('magic-auth')
  , path         = require('path')
  , R            = require('magic-router')
  , sslRedirect  = require('magic-ssl')
;

module.exports = function(M, S, dir) {
  var css         = ( S.get('css') || stylus )
    , env         = S.get('env') || 'production'
    , dbConf      = S.get('db') || false
    , faviconPath = path.join(dir, 'public', 'favicon.ico')
    , dirs        = S.get('dirs') || {
        public: path.join(dir, 'public')
      , views : path.join(dir, 'views')
    }
  ;

  if ( ! S.get('allowHttp') && S.get('env') === 'production' ) {
   // S.use(sslRedirect);
  }

  //set expiry headers
  S.use(headers);

  //fs.existsSync only gets called once
  if ( S.get('faviconExists') || fs.existsSync(faviconPath) ) {
    S.set('faviconExists', true);
    S.use( favicon(faviconPath) );
  }

  S.set('views', dirs.views);
  S.set('view engine', S.get('view engine') || 'jade');

  S.use(compression({ threshold: 128 }));

  S.use( css.middleware(dirs.public, {maxAge: '1d'}) );
  S.use( express.static(dirs.public, {maxAge: '1d'}) );

  //load the menu for the current host
  S.use(function(req, res, next) {
    menu(S, req, res , next);
  } );
  
  if ( S.get('db') ) {
    let dbConf = S.get('db')
      , schema = db(dbConf);
    ;

    S.set('schema', schema);
  }
  //logging
  S.use(morgan('combined'));

  //if host sets bodyparser to true, init it
  if ( S.get('bodyParser') ) {
    S.use(bodyParser.json());
    S.use(bodyParser.urlencoded({ extended: false }));
  }
  
  //if host sets cookieparser to true, init it:
  if ( S.get('cookieParser') ) {
    S.use(cookieParser());
  }
  
  if ( S.get('useAuth') ) {
    S.use(function (req, res, next) {
       auth.routes(S, req, res, next);
    });
  }

  //load host specific routes
  if ( S.get('routes') ) {
    let routes = S.get('routes');

    if ( typeof routes === 'array' || typeof routes === 'object' ) {
      for (var route in routes ) {
        S.use(route);
      }
    } else if ( typeof routes === 'function' ) { 
      S.use( routes );
    }
  }


  S.route('*').get(R);
  S.route('/:page').get(R);

  S.use(errorHandler);

  return S;
}
