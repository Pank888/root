'use strict';

var express      = require('express')
  , stylus       = require('stylus')
  , path         = require('path')
  , favicon      = require('serve-favicon')
  , cookieParser = require('cookie-parser')
  , bodyParser   = require('body-parser')
  , compression  = require('compression')
  , fs           = require('fs')
  , log          = require('magic-log')
  , db           = require('magic-db')
  , R            = require(path.join(__dirname, 'router') )
  , setHeaders   = require(path.join(__dirname, 'headers') )
  , sslRedirect  = require(path.join(__dirname, 'sslRedirect') )
;

module.exports = function(S, dir) {
  var css        = ( S.get('css') || stylus )
    , conf       = require(path.join(dir, 'config'))
    , dirs       = S.get('dirs') || {
          public : path.join(dir, 'public')
        , views  : path.join(dir, 'views')
        , favicon: path.join(dir, 'public', 'favicon.ico')
      }
  ;

  S.set('homeDir', dir);

  S.set('schema', db.init(conf.db) );

  if ( ! S.get('allowHttp') && S.get('env') === 'production' ) {
   // S.use(sslRedirect);
  }

  S.set('views', dirs.views);
  S.set('view engine', S.get('view engine') || 'jade');

  S.use(setHeaders);

  if ( fs.existsSync(dirs.favicon) ) {
    S.use( favicon(dirs.favicon) );
  }

  S.use( compression( {
    threshold: 128
  } ) );

  S.use( css.middleware(dirs.public, {maxAge: '1d'}) );
  S.use( express.static(dirs.public, {maxAge: '1d'}) );

  if ( S.get('routes') ) {
    S.use( S.get('routes') );
  }

  if ( S.get('bodyParser') ) {
    S.use(bodyParser.json());
    S.use(bodyParser.urlencoded({ extended: false }));
  }
  if ( S.get('cookieParser') ) {
    S.use(cookieParser());
  }

  S.route('*').get(R);
  // S.route('/:page').get(R);

  return S;
}
