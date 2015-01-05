'use strict';
//middleware function
module.exports = function (req, res, next) {
  var env = req.app.get('env') || 'production';
  if ( env !== 'development' ) {
    var maxAge = 60 * 60 * 24 * 7;
    res.set('Cache-Control', 'public, max-age=' + maxAge); // 4 days
    res.set('Expires', new Date(Date.now() + (maxAge * 1000)).toUTCString());  
  }
  res.set('X-Powered-By', 'magic');
  next();
}
