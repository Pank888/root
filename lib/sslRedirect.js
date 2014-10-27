'use strict';

module.exports = function sslRedirect(req, res, next) {
  if ( req.secure && req.protocol === 'https' ) {
    return next();
  }
  res.statusCode = 301;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Location', 'https://' + req.headers.host + req.url);
  res.end('redirecting to secure site');
}
