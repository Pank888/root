'use strict';

module.exports = function (req, res, next) {
  var maxAge = 60 * 60 * 24;

  res.set('X-Powered-By', 'magic');
  res.setHeader('Cache-Control', 'public, max-age=' + maxAge); // 4 days
  res.setHeader('Expires', new Date(Date.now() + (maxAge * 1000)).toUTCString());  

  next();
}
