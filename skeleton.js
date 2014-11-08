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
  , path         = require('path')
  , R            = require('magic-router')
  , sslRedirect  = require('magic-ssl')
;

module.exports = function(S, dir) {
  var css         = ( S.get('css') || stylus )
    , faviconPath = path.join(dir, 'public', 'favicon.ico')
    , env         = S.get('env') || 'development'
    , routes      = S.get('routes')
    , dbConf      = S.get('db') || false
    , dirs        = S.get('dirs') || {
        public: path.join(dir, 'public')
      , views : path.join(dir, 'views')
    }
  ;
  if ( dbConf ) {
    S.set('schema', db.init(dbConf) );
  }

  if ( ! S.get('allowHttp') && S.get('env') === 'production' ) {
   // S.use(sslRedirect);
  }

  S.use(headers);

  if ( fs.existsSync(faviconPath) ) {
    S.use( favicon(faviconPath) );
  }

  S.set('views', dirs.views);
  S.set('view engine', S.get('view engine') || 'jade');

  S.use(compression({
    threshold: 128
  }));

  S.use( css.middleware(dirs.public, {maxAge: '1d'}) );
  S.use( express.static(dirs.public, {maxAge: '1d'}) );

  if ( S.get('useMenu') ) {
    S.use(function(req, res, next) {
      menu(S, req, res , next);
    } );
  }

  S.use(morgan('combined'));

  if ( routes ) {
    if ( typeof routes === 'array' || typeof routes === 'object' ) {
      for (var route in routes ) {
        S.use(route);
      }
    } else if ( typeof routes === 'function' ) { 
      S.use( routes );
    }
  }

  if ( S.get('bodyParser') ) {
    S.use(bodyParser.json());
    S.use(bodyParser.urlencoded({ extended: false }));
  }
  if ( S.get('cookieParser') ) {
    S.use(cookieParser());
  }

  S.route('*').get(R);
  S.route('/:page').get(R);

  S.use(errorHandler);

  return S;
}
