'use strict';

module.exports = function sslRedirect(req, res, next) {
  if ( req.secure && req.protocol === 'https' ) {
    return next();
  }
  log('REQUEST FOR: ' + req.protocol + req.headers.host + req.url);
  res.redirect(301, 'https://' + req.headers.host + (req.url || '/') );
}
