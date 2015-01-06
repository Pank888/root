'use strict';
//middleware function
module.exports = function (req, res, next) {
  var app       = req.app
    , env       = app.get('env') || 'production';
    , poweredBy = app.get('X-Powered-By') || 'Magic'
    , maxAge    = app.get('maxAge') || 60 * 60 * 24 * 7 //default to 7 days
  ;
  
  if ( env !== 'development' ) {
    res.set('Cache-Control', 'public, max-age=' + maxAge);
    res.set('Expires', new Date(Date.now() + (maxAge * 1000)).toUTCString());  
  }

  res.set('X-Powered-By', poweredBy);
  next();
}
