'use strict';

var express = require('express')
  , stylus = require('stylus')
  , path = require('path')
  , favicon = require('serve-favicon')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , morgan = require('morgan')
  , fs = require('fs')
  , log = require('magic-log')
  , R = require(path.join(__dirname, 'router') )
;

module.exports = function(S, dir) {
  var dirs = S.get('dirs') || {
        public: path.join(dir, 'public')
      ,  views : path.join(dir, 'views')
    }
    , css = ( S.get('css') || stylus )
    , faviconPath = path.join(dirs.public, 'favicon.ico')
  ;

  if ( fs.existsSync(faviconPath) ) {
    S.use( favicon(faviconPath) );
  }

  S.set('views', dirs.views);
  S.set('view engine', S.get('view engine') || 'jade');
  
  S.use(morgan('combined'));

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

  S.route('/').get(R)
  S.route('/:page').get(R);

  return S;
}
