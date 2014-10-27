'use strict';

module.exports = function sslRedirect(req, res, next) {
  if ( req.secure && req.protocol === 'https' ) {
    return next();
  }
  res.redirect(301, 'https://' + req.headers.host + req.url || '/');
}
