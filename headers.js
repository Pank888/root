'use strict';
//middleware function
module.exports = function (req, res, next) {
  var maxAge = 60 * 60 * 24 * 7;

  res.set('X-Powered-By', 'magic');
  res.set('Cache-Control', 'public, max-age=' + maxAge); // 4 days
  res.set('Expires', new Date(Date.now() + (maxAge * 1000)).toUTCString());  

  next();
}
